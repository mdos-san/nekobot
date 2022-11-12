const request = require("supertest");
const server = require("../src");

const Redis = require("ioredis");
const redis = new Redis();

describe("POST /session", () => {
  it("Can authenticate", async () => {
    await request
      .agent(server)
      .post("/session")
      .send({ login: "admin", password: "admin" })
      .expect(200)
      .expect("set-cookie", /.*session=.*/g);
      // TODO: Check redis session
  });

  it("Should return a bad request when request is bad", async () => {
    await request.agent(server).post("/session").expect(400); // Credentials missing
  });

  it("Should return a bad request when login/password is bad", async () => {
    await request
      .agent(server)
      .post("/session")
      .send({ login: "bad", password: "bad" })
      .expect(401);
  });
});
