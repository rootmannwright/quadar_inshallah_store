import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleware.js";

import { createCheckoutSession } from "../controllers/paymentController.js";
import { createMercadoPagoPreference, createPixPayment, getPixStatus } from "../controllers/mercadoPagoController.js";

const router = express.Router();

/* =========================
   RATE LIMIT
========================= */

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas de pagamento. Tente novamente mais tarde.",
  },
});

/* =========================
   STRIPE
========================= */

router.post(
  "/checkout-session",
  paymentLimiter,
  authMiddleware,
  createCheckoutSession
);

/* =========================
   MERCADO PAGO — CHECKOUT PRO
========================= */

router.post(
  "/mercadopago",
  paymentLimiter,
  authMiddleware,
  createMercadoPagoPreference
);

/* =========================
   PIX
========================= */

router.post(
  "/pix",
  paymentLimiter,
  authMiddleware,
  createPixPayment
);

router.get(
  "/pix/:paymentId/status",
  authMiddleware,
  getPixStatus
);

/* =========================
   HEALTH CHECK
========================= */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Payments OK 🚀",
  });
});

export default router;