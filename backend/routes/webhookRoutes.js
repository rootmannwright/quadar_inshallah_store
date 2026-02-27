import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// eslint-disable-next-line no-undef
router.post("/create-intent", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Basic validation to avoid unnecessary database queries
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await Order.findById(orderId);

    // If the order does not exist, return 404
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Make sure the logged-in user owns this order
    // This prevents IDOR attacks and unauthorized payments
    if (order.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Prevent duplicate payments
    // If the order is already marked as paid, we should not create another PaymentIntent
    if (order.status === "paid") {
      return res.status(400).json({
        error: "This order has already been paid",
      });
    }

    // Create the PaymentIntent in Stripe
    // Amount must be sent in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "brl",
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      error: "Internal server error while creating payment",
    });
  }
});

export default router;