// controller/webhookController.js
import Stripe from "stripe";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const orderId = paymentIntent.metadata.orderId;

        const order = await Order.findById(orderId);

        if (!order) {
          console.error("Order not found:", orderId);
          return res.status(404).end();
        }

        // Avoid double processing.
        if (order.status === "paid") {
          return res.status(200).end();
        }

        order.status = "paid";
        order.paymentIntentId = paymentIntent.id;
        await order.save();

        console.log("✅ Pedido pago:", orderId);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("❌ Pagamento falhou:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}