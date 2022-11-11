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

module.exports = app;
