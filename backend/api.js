// ==========================
// CORE IMPORTS
// ==========================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import "dotenv/config";
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
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

// ==========================
// APP INITIALIZATION
// ==========================
const app = express();
app.disable("x-powered-by"); // Hide Express signature
app.set("trust proxy", 1);   // Required for secure cookies behind reverse proxy

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// GLOBAL SECURITY MIDDLEWARES
// ==========================

// Enable secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
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

// Enable CORS with strict origin control
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// Prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Parse JSON body
app.use(express.json({ limit: "10kb" })); // Limit payload size to prevent abuse

// Request logging
app.use(requestLogger);

// ==========================
// RATE LIMITING
// ==========================

// General API rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api", globalLimiter);

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many login attempts. Account temporarily locked."
  }
});

app.use("/api/auth/login", authLimiter);

// ==========================
// STATIC FILES
// ==========================
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// DATABASE CONNECTION
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ==========================
// WEBHOOK ROUTES
// ==========================
// IMPORTANT: If using Stripe or similar, raw body parsing must be configured inside webhookRoutes
app.use("/api/webhooks", webhookRoutes);

// ==========================
// MAIN API ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);

// ==========================
// ROOT ROUTE
// ==========================
app.get("/", (req, res) => {
  res.json({
    message: "Quadar Inshallah API running securely 🚀"
  });
});

// ==========================
// GLOBAL ERROR HANDLER
// ==========================
app.use(errorHandler);

// ==========================
// SERVER START
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});