const request = require("supertest");

const server = require("../src");

describe("GET /", () => {
  it("Should respond with 'Hello, world!'", () => {
    return request.agent(server).get("/").expect(200).expect("Hello, world!");
  });
});
