import dotenv from "dotenv";
dotenv.config();

import app from "./api.js";
import { connectDB } from "./db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não definida");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server rodando em http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error.message);
    process.exit(1);
  }
}

startServer();