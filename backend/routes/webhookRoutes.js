// routes/webhookRoutes.js
import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import Joi from "joi";
import rateLimiter from "express-rate-limit";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not defined");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const paymentLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50, // Less requests allowed for payment-related endpoints.
  message: "Too many payment requests from this IP, please try again later."
});

// POST /stripe/webhook - Stripe webhook endpoint (no auth, but rate limited)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// POST /stripe/create-intent - Create Stripe Payment Intent for an order (protected, rate limited)
router.post("/create-intent", authMiddleware, paymentLimiter, async (req, res) => {
  try {
    // eslint-disable-next-line no-undef
    const schema = Joi.object({
      // eslint-disable-next-line no-undef
      orderId: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error || !mongoose.Types.ObjectId.isValid(value.orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findById(value.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (order.status === "paid") {
      return res.status(400).json({ error: "This order has already been paid" });
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "brl",
      payment_method_types: ["brl", "card", "boleto", "pix"],
      metadata: { orderId: order._id.toString()},
    },
    {
      idempotencyKey: order._id.toString() + "-" + Date.now()
    }
  );

    return res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("Error creating payment intent:", err);
    return res.status(500).json({ error: "Internal server error while creating payment" });
  }
});

export default router;