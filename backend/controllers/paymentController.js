// controller/paymentController.js
import Stripe from "stripe";
import Joi from "joi";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not defined");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const createCheckoutSession = async (req, res) => {
  try {
    const schema = Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { items } = value;

    const ids = items.map((i) => i.productId);

    const products = await Product.find({ _id: { $in: ids } });

    if (!products.length) {
      return res.status(404).json({ error: "Products not found" });
    }

    const line_items = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );

      if (!product) {
        throw new Error(`Produto não encontrado: ${item.productId}`);
      }

      const price = Number(product.price);

      if (!price || isNaN(price)) {
        throw new Error(`Preço inválido: ${product.name}`);
      }

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Calc total for order record.
    const total = items.reduce((acc, item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );
      return acc + product.price * item.quantity;
    }, 0);

    const order = await Order.create({
      userId: req.user?.id || null,
      items,
      total,
      status: "pending",
    });

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          orderId: order._id.toString(),
        },
      },
      {
        idempotencyKey: order._id.toString(),
      }
    );

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const handleWebhook = async (req, res) => {
  const stripe = getStripe();
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
      case "checkout.session.completed": {
        const session = event.data.object;

        const orderId = session.metadata.orderId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) break;

        await Order.findByIdAndUpdate(orderId, {
          status: "paid",
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            status: "failed",
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
