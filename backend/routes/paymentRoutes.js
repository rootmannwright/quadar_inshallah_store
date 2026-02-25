import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create PaymentIntent
router.post("/create-intent", authMiddleware, async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // cents
    currency: "brl",
    metadata: { orderId: order._id.toString() },
  });

  return res.json({ clientSecret: paymentIntent.client_secret });
});

export default router;