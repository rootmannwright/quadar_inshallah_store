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

// ==========================
// ROUTES
// ==========================
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

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
// GLOBAL SECURITY MIDDLEWARES
// ==========================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5173", "https://api.stripe.com"],
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
// CORS CONFIGURATION
// ==========================
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// ==========================
// BODY PARSING & SANITIZATION
// ==========================
app.use(express.json({ limit: "10kb" }));
app.use(hpp());

// ==========================
// REQUEST LOGGING
// ==========================
app.use(requestLogger);

// ==========================
// RATE LIMITING
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
  message: { error: "Too many login attempts. Account temporarily locked." }
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

// ==========================
// ROOT ROUTE
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "Quadar Inshallah API running securely 🚀" });
});

// ==========================
// GLOBAL ERROR HANDLER
// ==========================
app.use(errorHandler);

// ==========================
// EXPORT APP
// ==========================
export default app;