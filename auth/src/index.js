const { v4: uuid }= require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hash(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

const Redis = require("ioredis");
const redis = new Redis();

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/redis", async (req, res) => {
  res.send(await redis.info());
});

app.post("/setup", async (req, res) => {
  const result = await redis.hget("user:admin", "login");

  if (result === null) {
    redis.hset(
      "user:admin",
      "login",
      "admin",
      "password",
      await hash("admin"),
      "role",
      "admin"
    );
    res.status(200);
  } else {
    res.status(400);
  }

  res.end();
});

app.post("/session", async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password || login === "" || password === "") {
    res.status(400);
    res.end();
    return ;
  }

  // Fetch hashed password from the DB
  const dbHashedPassword = await redis.hget(`user:${login}`, "password");
  if (!dbHashedPassword) {
    res.status(401);
    res.end();
    return ;
  }

  const isValidPassword = await bcrypt.compare(password, dbHashedPassword);

  if (isValidPassword) {
    const sessionDurationMS = 604800000;
    const sessionId = uuid();

    await redis.set(`session:${sessionId}`, `user:${login}`); // TODO: Expire redis item

    res.status(200);
    res.cookie("session", sessionId, {
      maxAge: sessionDurationMS,
      secure: true,
      httpOnly: true,
    });
  } else {
    res.status(401);
  }

  res.end();
});

module.exports = app;
