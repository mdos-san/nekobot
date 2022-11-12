const request = require("supertest");
const server = require("../src");

const Redis = require("ioredis");
const redis = new Redis();

describe("POST /setup", () => {
  it("Should create a new admin account", async () => {
    await request.agent(server).post("/setup").expect(200);

    // Assertions
    const userAdmin = await redis.hgetall("user:admin");
    expect(userAdmin.login).toBe("admin");
    expect(userAdmin.password).not.toBe(undefined);
    expect(userAdmin.password).not.toBe("");
    expect(userAdmin.password).not.toBe("admin"); // Password should be hashed
    expect(userAdmin.role).toBe("admin");
  });

  it("Should return a bad request", () => {
    return request.agent(server).post("/setup").expect(400);
  });
});
