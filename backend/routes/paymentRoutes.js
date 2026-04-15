import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCheckoutSession,
} from "../controllers/paymentController.js";

const router = express.Router();

// Router from /api/payments/checkout-session
router.post(
  "/checkout-session",
  authMiddleware,
  createCheckoutSession
);

export default router;