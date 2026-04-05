// ==========================
// CORE IMPORTS
// ==========================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

// ==========================
// ROUTES
// ==========================
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// ==========================
// CUSTOM MIDDLEWARES
// ==========================
import errorHandler from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

// ==========================
// APP INITIALIZATION
// ==========================
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// SECURITY (HELMET)
// ==========================
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
          "http://localhost:5000",
          "https://api.stripe.com"
        ],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts:
      process.env.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false
  })
);

// ==========================
// CORS
// ==========================
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// ==========================
// SESSION (ESSENCIAL PRO CART)
// ==========================
app.use(
  session({
    name: "qid",
    secret: "quadar-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,       // HTTP local: precisa ser false
      sameSite: "lax",     // necessário para React frontend localhost
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
    }
  })
);
// ==========================
// BODY PARSER
// ==========================
app.use(express.json({ limit: "10kb" }));
app.use(hpp());

// ==========================
// LOGGING
// ==========================
app.use(requestLogger);

// ==========================
// RATE LIMIT
// ==========================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." }
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again later." }
});
app.use("/api/auth/login", authLimiter);

// ==========================
// STATIC FILES
// ==========================
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// ROUTES
// ==========================
app.use("/api/webhooks", webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);

// ==========================
// ROOT
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "Quadar Inshallah API running 🚀" });
});

// ==========================
// ERROR HANDLER
// ==========================
app.use(errorHandler);

// ==========================
// EXPORT
// ==========================
export default app;