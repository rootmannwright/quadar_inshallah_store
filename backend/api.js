import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// MIDDLEWARES
import errorHandler from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

dotenv.config();

const app = express();

/* =========================
   🔐 CORE SECURITY FLAGS
========================= */

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* =========================
   📁 PATH RESOLVE
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   🛡️ HELMET (HEADERS SECURITY)
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
          process.env.CLIENT_URL || "http://localhost:5173",
          "https://api.stripe.com",
        ],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

/* =========================
   🌐 CORS (FRONTEND ACCESS)
========================= */

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

/* =========================
   📦 BODY PARSERS
========================= */

// Stripe webhook precisa raw
app.use("/api/webhooks", express.raw({ type: "application/json" }));

// JSON geral
app.use(express.json({ limit: "10kb" }));

// Cookies (session/cart fallback)
app.use(cookieParser());

/* =========================
   🧼 SECURITY LAYERS
========================= */

// Remove query pollution (?a=1&a=2)
app.use(hpp());

// Logger
app.use(requestLogger);

/* =========================
   🚦 RATE LIMITING
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
   🧭 ROUTES
========================= */

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Protected business logic (JWT middleware deve estar dentro das rotas)
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

// Stripe webhook (NO JSON middleware!)
app.use("/api/webhooks", webhookRoutes);

/* =========================
   🖼️ STATIC FILES
========================= */

app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"))
);

/* =========================
   ❤️ HEALTH CHECK
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