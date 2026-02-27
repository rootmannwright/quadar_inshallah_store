import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================
// 1️⃣ PaymentIntent (Integrating Stripe Elements)
// ==========================
router.post("/create-intent", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== req.userId.toString())
      return res.status(403).json({ error: "Access denied" });
    if (order.status === "paid")
      return res.status(400).json({ error: "This order has already been paid" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "brl",
      metadata: { orderId: order._id.toString() },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({ error: "Internal server error while creating payment" });
  }
});

// ==========================
// 2️⃣ Checkout Session (Redirecting to Stripe's hosted page)
// ==========================
router.post("/checkout-session", async (req, res) => {
  try {
    const { items } = req.body; // [{ name, price, quantity }]

    const line_items = items.map(item => ({
      price_data: {
        currency: "brl",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;