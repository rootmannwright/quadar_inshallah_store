import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error`);
  }

  // Pagamento confirmado
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const orderId = intent.metadata.orderId;

    const order = await Order.findById(orderId);

    if (order && order.status !== "paid") {
      // baixa estoque agora
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        product.stock -= item.qty;
        await product.save();
      }

      order.status = "paid";
      await order.save();
    }
  }

  res.json({ received: true });
});

export default router;
