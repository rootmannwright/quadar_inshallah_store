import express from "express";
import Stripe from "stripe";
import Joi from "joi";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================
// 1️⃣ PaymentIntent (Integrating Stripe Elements)
// ==========================
router.post("/create-intent/:orderId", authMiddleware, async (req, res) => {
  try {
    const createIntentSchema = Joi.object({
      orderId: Joi.string().required(),
    });
    
   
    const { error, value } = createIntentSchema.validate(req.params);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { orderId } = value;

    const order = await Order.findById(orderId).select("total userId status");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "brl",
      metadata: { orderId: order._id.toString() },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return res.status(500).json({ error: "Internal server error while creating payment" });
  }
});

// ==========================
// 2️⃣ Checkout Session (Redirecting to Stripe's hosted page)
// ==========================
router.post("/checkout-session", async (req, res) => {
  try {
    const checkoutSchema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().required(),
          quantity: Joi.number().required(),
        })
      ).min(1).required(),
    });

    const { error, value } = checkoutSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { items } = value;

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