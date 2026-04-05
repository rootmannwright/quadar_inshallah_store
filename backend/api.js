// api.js
import express                   from "express";
import cors                      from "cors";
import helmet                    from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import hpp                       from "hpp";
import session                   from "express-session";
import MongoStore                from "connect-mongo";
import path                      from "path";
import { fileURLToPath }         from "url";
import dotenv                    from "dotenv";

dotenv.config();

// ==========================
// ROUTES
// ==========================
import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";

// ==========================
// MIDDLEWARES
// ==========================
import errorHandler      from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

// ==========================
// APP INIT
// ==========================
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ==========================
// SECURITY — HELMET
// ==========================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:              ["'self'"],
        scriptSrc:               ["'self'"],
        styleSrc:                ["'self'", "'unsafe-inline'"],
        imgSrc:                  ["'self'", "data:", "https:"],
        connectSrc:              [
          "'self'",
          process.env.CLIENT_URL || "http://localhost:5173",
          "https://api.stripe.com",
        ],
        objectSrc:               ["'none'"],
        frameAncestors:          ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// ==========================
// CORS
// ==========================
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ==========================
// BODY PARSER
// ==========================
// Webhook da Stripe precisa do body RAW — deve vir ANTES do express.json()
app.use("/api/webhooks", express.raw({ type: "application/json" }));

// Limita payload a 10kb para evitar ataques de body flooding
app.use(express.json({ limit: "10kb" }));

// ==========================
// HTTP PARAMETER POLLUTION
// ==========================
app.use(hpp());

// ==========================
// LOGGING
// ==========================
app.use(requestLogger);

// ==========================
// SESSION
// Cart usa req.session — funciona para guests e usuários logados.
// connect-mongo persiste as sessões no MongoDB, sobrevivendo a restarts.
// ==========================
app.use(
  session({
    name:              "qid",
    secret:            process.env.SESSION_SECRET || "troque-este-secret-em-producao",
    resave:            false,
    saveUninitialized: false, // não cria sessão para quem não tem cart ainda
    store: MongoStore.create({
      mongoUrl:       process.env.MONGO_URI,
      collectionName: "sessions",
      ttl:            60 * 60 * 24 * 7, // 7 dias em segundos
      autoRemove:     "native",
    }),
    cookie: {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production", // true só em HTTPS
      sameSite: "lax",
      maxAge:   1000 * 60 * 60 * 24 * 7, // 7 dias em ms
    },
  })
);

// ==========================
// RATE LIMITERS
// ==========================

// Geral — proteção contra scraping e DDoS básico
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => ipKeyGenerator(req),
  message: { success: false, message: "Muitas requisições. Tente novamente em 15 minutos." },
});

// Login — brute force protection
const loginLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  keyGenerator:           (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    });
  },
});

app.use(globalLimiter);

// ==========================
// ROUTES
// ==========================
app.use("/api/auth/login", loginLimiter);

app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/webhooks", webhookRoutes);

// ==========================
// STATIC FILES
// ==========================
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ==========================
// HEALTHCHECK
// ==========================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Quadar Inshallah API running 🚀" });
});

// ==========================
// 404
// ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Rota não encontrada" });
});

// ==========================
// ERROR HANDLER GLOBAL — deve ser o ÚLTIMO middleware
// ==========================
app.use(errorHandler);

export default app;