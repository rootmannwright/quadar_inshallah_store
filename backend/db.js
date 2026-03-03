import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // apenas a URI
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error);
    process.exit(1);
  }
}