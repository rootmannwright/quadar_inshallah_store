// ===================== IMPORTS =====================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

// Models
import User from "./models/User.js";

// Customized middlewares
import { generalLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { cookieMiddleware } from "./middleware/cookies.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { adminOnly } from "./middleware/adminOnly.js";

dotenv.config();

// ===================== CONFIGS =====================

// Corrige __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();
app.disable("x-powered-by"); // remove header Express
app.set("trust proxy", 1);   // necessary to cookies secure + proxy

// ===================== GLOBAL MIDDLEWARES=====================

// Cookies (Before routes)
app.use(cookieMiddleware);

// Body parser
app.use(express.json());

// CORS secure 
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Logger
app.use(requestLogger);

// Rate limit global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
app.use(generalLimiter);

// ===================== SECURITY (HELMET) =====================
app.use(
  helmet({
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
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    frameguard: { action: "deny" },
    noSniff: true,
    hsts: process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false
  })
);

// ===================== STATIC FILES =====================
app.use(express.static(path.join(__dirname, "public")));

// ===================== DATABASE =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Erro MongoDB:", err));

// ===================== WEBHOOKS (BEFORE JSON) =====================
app.use("/api/webhooks", webhookRoutes);

// ===================== ROUTES =====================
app.use("/api/users", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);

// ===================== LOGIN =====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // JWT in COOKIE
    req.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      signed: true,
      maxAge: 60 * 60 * 1000
    });

    return res.json({
      message: "Login realizado com sucesso",
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

// ===================== MAIN ROUTE =====================
app.get("/", (req, res) => {
  const lastVisit = req.cookies.get("LastVisit", { signed: true });

  req.cookies.set("LastVisit", new Date().toISOString(), {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  if (lastVisit) {
    return res.send(`Bem-vindo de volta! Última visita: ${lastVisit}`);
  }

  return res.send("Bem-vindo à loja Quadar Inshallah! 👋");
});

// ===================== ROBOTS =====================
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nDisallow: /admin/\nDisallow: /api/`.trim());
});

// ===================== ERROR HANDLER =====================
app.use(errorHandler);

// ===================== START =====================
app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor rodando na porta 3000 🚀");
});