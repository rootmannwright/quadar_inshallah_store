import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleware.js";

import { createCheckoutSession } from "../controllers/paymentController.js";
import { createMercadoPagoPreference, createPixPayment, getPixStatus } from "../controllers/mercadoPagoController.js";

const router = express.Router();

// Rate limit
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

// Stripe Checkout Session
router.post(
  "/checkout-session",
  paymentLimiter,
  authMiddleware,
  createCheckoutSession
);

// Checkout Pro (Stripe) - for future use
router.post(
  "/mercadopago",
  paymentLimiter,
  authMiddleware,
  createMercadoPagoPreference
);

// PIX (MercadoPago)
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

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Payments OK 🚀",
  });
});

export default router;