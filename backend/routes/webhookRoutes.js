import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("STRIPE_SECRET_KEY não definida");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });
};

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const intentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests, please try again later." },
});

const createIntentSchema = z.object({
  orderId: z
    .string({ required_error: "orderId é obrigatório" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "orderId inválido",
    }),
});

router.post(
  "/webhook",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  handleWebhook
);

router.post("/create-intent", intentLimiter, authMiddleware, async (req, res) => {
  try {
    const result = createIntentSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      return res.status(400).json({ error: message });
    }

    const { orderId } = result.data;

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (order.status === "paid") {
      return res.status(409).json({ error: "Este pedido já foi pago" });
    }

    if (order.status === "cancelled") {
      return res.status(409).json({ error: "Este pedido foi cancelado" });
    }

    const stripe = getStripe();

    const idempotencyKey = `create-intent-${orderId}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.total * 100),
        currency: "brl",
        payment_method_types: ["card", "boleto", "pix"],
        metadata: { orderId: order._id.toString(), userId: req.user.id },
      },
      { idempotencyKey }
    );

    return res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[POST /stripe/create-intent]", err);
    return res.status(500).json({ error: "Erro ao criar intenção de pagamento" });
  }
});

export default router;