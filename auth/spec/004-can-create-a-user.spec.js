const request = require("supertest");
const server = require("../src");

const Redis = require("ioredis");
const redis = new Redis();

describe("POST /user", () => {
    it("Can create a user", async () => {
        const sessionResponse = await request
            .agent(server)
            .post("/session")
            .send({login: "admin", password: "admin"})
        const sessionCookie = sessionResponse.headers['set-cookie'];

        const userResponse = await request
            .agent(server)
            .post("/user")
            .set('Cookie', [sessionCookie])
            .send({login: "user01", password: "Secret42"})
            .expect(200)

        // Assertions
        const userAdmin = await redis.hgetall(`user:${userResponse.body.userId}`);
        expect(userAdmin.login).toBe("user01");
        expect(userAdmin.password).not.toBe(undefined);
        expect(userAdmin.password).not.toBe("");
        expect(userAdmin.password).not.toBe("Secret42"); // Password should be hashed
        expect(userAdmin.role).toBe("user");
    });
});
