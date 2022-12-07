const { v4: uuid } = require("uuid");
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
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

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
    return;
  }

  // Fetch hashed password from the DB
  const dbHashedPassword = await redis.hget(`user:${login}`, "password");
  if (!dbHashedPassword) {
    res.status(401);
    res.end();
    return;
  }

  const isValidPassword = await bcrypt.compare(password, dbHashedPassword);

  if (isValidPassword) {
    const sessionDurationMS = 604800000;
    const sessionId = uuid();

    await redis.set(`session:${sessionId}`, `user:${login}`); // TODO: Expire redis item

    res.status(200);
    res.cookie("session", sessionId, {
      maxAge: sessionDurationMS,
      httpOnly: true,
    });
  } else {
    res.status(401);
  }

  res.end();
});

async function sessionMiddleware(req, res, next) {
  const { session } = req.cookies;
  if (!session) {
    res.status(401);
    res.end();
    return;
  }

  req.userId = await redis.get(`session:${session}`);
  req.userRole = await redis.hget(req.userId, "role");
  next();
}

app.post("/user", sessionMiddleware, async (req, res) => {
  if (req.userRole !== "admin") {
    res.status(403);
    res.end({ userId });
    return ;
  }

  const { login, password } = req.body;
  const userId = uuid();
  redis.hset(
    `user:${userId}`,
    "login",
    login,
    "password",
    await hash(password),
    "role",
    "user"
  );

  res.status(200);
  res.json({ userId })
  res.end()
});

module.exports = app;
