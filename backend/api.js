import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import csrf from "csurf";
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

app.disable("x-powered-by");
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================== SECURITY ==========================
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

// ========================== CORS ==========================
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);

// ========================== BODY ==========================
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10kb" }));

// ========================== COOKIES ==========================
app.use(cookieParser()); // 🔥 ESSENCIAL

// ========================== EXTRA PROTECTION ==========================
app.use(hpp());
app.use(requestLogger);

// ========================== RATE LIMIT ==========================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    keyGenerator: (req) => ipKeyGenerator(req),
  })
);

// ========================== CSRF ==========================
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});

// ========================== CSRF TOKEN ROUTE ==========================
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ========================== ROUTES ==========================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", csrfProtection, cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

// ========================== STATIC ==========================
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ========================== ROOT ==========================
app.get("/", (req, res) => {
  res.json({ success: true, message: "API running 🚀" });
});

// ========================== 404 ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// ========================== ERROR HANDLER ==========================
app.use(errorHandler);

export default app;

// ========================== WEBHOOK CONTROLLER ==========================

import Stripe from "stripe";
import Order from "./models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).end();

      if (order.status === "paid") return res.status(200).end();

      order.status = "paid";
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      console.log("✅ Pedido pago:", orderId);
    }

    if (event.type === "payment_intent.payment_failed") {
      console.log("❌ Pagamento falhou");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
}
