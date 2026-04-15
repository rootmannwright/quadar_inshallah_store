// ../tests/setup.test.js
// Still in development
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest, beforeAll, afterAll, afterEach, global } from "@jest/globals";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    dbName: "test-db",
  });

  if (process.env.DEBUG_TESTS === "true") {
    console.log("🧪 MongoDB in-memory started:", uri);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }

  jest.clearAllMocks?.();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }

  if (process.env.DEBUG_TESTS === "true") {
    console.log("🧪 MongoDB in-memory stopped");
  }
});

global.testUtils = {
  getMongoUri: () => mongoose.connection.client.s.url,
};