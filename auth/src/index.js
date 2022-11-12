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

module.exports = app;
