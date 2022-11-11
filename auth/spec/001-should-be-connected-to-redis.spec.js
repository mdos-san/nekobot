const request = require("supertest");
const server = require("../src");

describe("GET /", () => {
  it("Should respond with redis version", () => {
    return request.agent(server).get("/redis").expect(200);
  });
});
