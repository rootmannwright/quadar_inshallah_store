import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import User from "./models/User.js";

import { generalLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

dotenv.config();

// Corrige __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();
app.disable("x-powered-by"); // remove header que mostra Express
app.set("trust proxy", 1);

// ===== Rotas Webhook =====
app.use("/api/webhooks", webhookRoutes);

// ===== Middlewares Globais =====
app.use(express.json());

// CORS restrito — resolve alerta "Access-Control-Allow-Origin: *"
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(requestLogger);

// Rate Limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
app.use(generalLimiter);

// ===== Helmet Segurança (baseado no ZAP) =====
app.use(
  helmet({
    // CSP completa — sem wildcard e sem fallback faltando
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: ["'self'"],

        styleSrc: ["'self'"],

        imgSrc: ["'self'", "data:", "https:"],

        fontSrc: ["'self'"],

        connectSrc: ["'self'", "http://localhost:3000"],

        frameAncestors: ["'none'"],

        frameSrc: ["'none'"],

        mediaSrc: ["'self'"],

        workerSrc: ["'self'"],

        objectSrc: ["'none'"],

        baseUri: ["'self'"],

        formAction: ["'self'"]
      }
    },

    // Clickjacking protection
    frameguard: { action: "deny" },

    // MIME sniffing protection
    noSniff: true,

    // HSTS — só ativa em produção HTTPS
    hsts: process.env.NODE_ENV === "production" ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false
  })
);

// ===== Arquivos estáticos =====
app.use(express.static(path.join(__dirname, "public")));

// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Erro MongoDB:", err));

// ===== Rotas API =====
app.use("/api/users", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);

// ===== Login JWT =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    if (user.password !== password)
      return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign(
      { userId: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// ===== Página principal =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Robots
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nDisallow: /admin/\nDisallow: /api/`.trim());
});

// ===== Error Handler =====
app.use(errorHandler);

// ===== Start =====
app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor rodando na porta 3000 🚀");
});
