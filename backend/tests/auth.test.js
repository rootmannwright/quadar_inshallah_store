import request from "supertest";
import mongoose from "mongoose";
import app from "../api.js";

// eslint-disable-next-line no-undef
afterAll(async () => {
  await mongoose.connection.close();
});

// eslint-disable-next-line no-undef
describe("Auth - Register", () => {
  // eslint-disable-next-line no-undef
  it("should create a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Lucas",
      email: "lucas@test.com",
      password: "123456"
    });

    // eslint-disable-next-line no-undef
    expect(res.statusCode).toBe(201);
    // eslint-disable-next-line no-undef
    expect(res.body.user).toHaveProperty("email");
  });
});