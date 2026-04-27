import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import authMiddleware from "../middleware/authMiddleware.js";
import csrfMiddleware from "../middleware/csrfMiddleware.js";
import {
  createOrder,
  getOrderById,
  getMyOrders,
} from "../controllers/orderController.js";

const router = express.Router();

const orderPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,   // envia RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const orderGetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const orderIdSchema = z.object({
  id: z
    .string({ required_error: "Order ID é obrigatório" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Order ID inválido",
    }),
});

const validateOrderId = (req, res, next) => {
  const result = orderIdSchema.safeParse(req.params);

  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Parâmetro inválido";
    return res.status(400).json({ error: message });
  }

  req.params.id = result.data.id;
  return next();
};

router.get("/my", orderGetLimiter, authMiddleware, getMyOrders);

router.get("/:id", orderGetLimiter, authMiddleware, validateOrderId, getOrderById);

router.post("/", orderPostLimiter, authMiddleware, csrfMiddleware, createOrder);

export default router;