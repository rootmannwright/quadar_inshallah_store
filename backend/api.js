import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { generateToken, doubleCsrfProtection } from "./middleware/csrf.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

dotenv.config();

const app = express();

/* =========================
   🔐 CORE SECURITY
========================= */

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* =========================
   📁 PATH
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   🛡️ HELMET
========================= */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "http://localhost:3000",
          process.env.CLIENT_URL,
          "https://api.stripe.com",
          "https://api.mercadopago.com",
        ].filter(Boolean),
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

/* =========================
   🌐 CORS
========================= */

app.use(
  cors({
    origin: (origin, callback) => {
      // Sem origin = request server-to-server ou Postman
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (allowed.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

/* =========================
   📦 BODY PARSERS
========================= */

// Stripe webhook precisa do body raw
app.use("/api/webhooks", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   🧼 SECURITY LAYERS
========================= */

app.use(hpp());
app.use(requestLogger);

/* =========================
   🚦 RATE LIMIT GLOBAL
========================= */

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req),
    message: {
      success: false,
      message: "Muitas requisições. Tente novamente mais tarde.",
    },
  })
);

/* =========================
   🔑 CSRF TOKEN
========================= */

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

/* =========================
   🧭 ROUTES
========================= */

// Produtos — público, sem CSRF
app.use("/api/products", productRoutes);

// Auth — CSRF obrigatório
app.use("/api/auth", authRoutes);

// Carrinho — CSRF obrigatório
app.use("/api/cart", doubleCsrfProtection, cartRoutes);

// Pagamentos — SEM CSRF (providers externos fazem redirect)
app.use("/api/payments", paymentRoutes);

// Webhooks — SEM CSRF (chamadas server-to-server do Stripe/MP)
app.use("/api/webhooks", webhookRoutes);

/* =========================
   📁 STATIC FILES
========================= */

app.use("/images", express.static(path.join(__dirname, "public/images")));

/* =========================
   🩺 HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API running 🚀",
    status: "healthy",
  });
});

/* =========================
   ❌ 404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ⚠️ GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

export default app;