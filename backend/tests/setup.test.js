// tests/auth.test.js
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api.js";

let mongoServer;

// ======= SETUP E TEARDOWN DO BANCO =======
// eslint-disable-next-line no-undef
beforeAll(async () => {
  // Cria um MongoDB em memória
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// eslint-disable-next-line no-undef
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// eslint-disable-next-line no-undef
afterEach(async () => {
  // Limpa todas as collections após cada teste
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ======= TESTE DE REGISTER =======
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
    // eslint-disable-next-line no-undef
expect(res.body.user.email).toBe("lucas@test.com");
  });
// eslint-disable-next-line no-undef
  it("should not allow duplicate email", async () => {
    // Cria usuário inicial
    await request(app).post("/api/auth/register").send({
      name: "Lucas",
      email: "lucas@test.com",
      password: "123456"
    });

    // Tenta criar novamente com mesmo email
    const res = await request(app).post("/api/auth/register").send({
      name: "Lucas 2",
      email: "lucas@test.com",
      password: "123456"
    });
  // eslint-disable-next-line no-undef
    expect(res.statusCode).toBe(409);
    // eslint-disable-next-line no-undef
expect(res.body).toHaveProperty("error");
  });
});