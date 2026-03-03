// server.js
import app from "./api.js";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error initialize server:", error);
  }
}

startServer();