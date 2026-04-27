import dotenv from "dotenv";
dotenv.config();

import app from "./api.js";
import { connectDB } from "./db.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "CSRF_SECRET",
  "CLIENT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "MP_ACCESS_TOKEN",
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error("❌ Variáveis de ambiente não definidas:", missingEnv.join(", "));
  process.exit(1);
}

function shutdown(signal) {
  console.log(`\n⚠️  ${signal} recebido — encerrando servidor...`);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("❌ uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ unhandledRejection:", reason);
  process.exit(1);
});

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Server rodando em http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
    });

    if (NODE_ENV !== "production") {
      await import("./ngrok/tunnel.js");
    }
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error.message);
    process.exit(1);
  }
}

startServer();