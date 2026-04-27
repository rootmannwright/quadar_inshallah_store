import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import { generateCsrfToken, doubleCsrfProtection } from "./middleware/csrf.js";

import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";

import errorHandler          from "./middleware/errorHandler.js";
import { requestLogger }     from "./middleware/requestLogger.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Helmet
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'"],
        imgSrc:         ["'self'", "data:", "https:"],
        connectSrc:     [
          "'self'",
          "http://localhost:5173",
          "http://localhost:3000",
          process.env.CLIENT_URL,
          "https://api.stripe.com",
          "https://api.mercadopago.com",
        ].filter(Boolean),
        objectSrc:      ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.includes(".ngrok-free.dev")) {
      return callback(null, true);
    }

    console.log("❌ CORS bloqueado:", origin);
    return callback(new Error(`CORS bloqueado: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-csrf-token"
  ]
}));

app.options(/.*/, cors());

// ---------------------------------------------------------------------------
// Body parsers — webhook raw ANTES do express.json
// ---------------------------------------------------------------------------
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Segurança + logging
// ---------------------------------------------------------------------------
app.use(hpp());
app.use(requestLogger);

// ---------------------------------------------------------------------------
// Rate limiter global
// ---------------------------------------------------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    // ipKeyGenerator removido — express-rate-limit v7 já usa IP por padrão
    message: {
      success: false,
      message: "Muitas requisições. Tente novamente mais tarde.",
    },
  })
);

// ---------------------------------------------------------------------------
// CSRF token — público, chamado pelo frontend antes de mutações
// FIX: overwrite: true obrigatório no csrf-csrf v4
// ---------------------------------------------------------------------------
app.get("/api/csrf-token", (req, res) => {
  try {
    const token = generateCsrfToken(req, res, true);
    return res.json({ csrfToken: token });
  } catch (err) {
    console.error("[CSRF TOKEN ERROR]", err);
    return res.status(500).json({ error: "Erro ao gerar token CSRF" });
  }
});

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
app.use("/api/products", productRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/cart",     doubleCsrfProtection, cartRoutes);
app.use("/api/payments", doubleCsrfProtection, paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

// ---------------------------------------------------------------------------
// Estáticos, health check, 404
// ---------------------------------------------------------------------------
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/health", (_req, res) =>
  res.json({ success: true, message: "API running 🚀", status: "healthy" })
);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.use(errorHandler);

export default app;