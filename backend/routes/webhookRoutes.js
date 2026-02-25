import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Confirmed payment
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const orderId = intent.metadata.orderId;

      const order = await Order.findById(orderId);

      if (order && order.status !== "paid") {
        // reduce stock for each item
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          product.stock -= item.qty;
          await product.save();
        }

        order.status = "paid";
        await order.save();
      }
    }

    return res.json({ received: true });
     // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(400).send("Webhook Error");
  }
});