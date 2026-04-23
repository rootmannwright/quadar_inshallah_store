import Stripe from "stripe";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Joi from "joi";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/* =========================
   CONFIG STRIPE (lazy)
========================= */
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não definida");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

/* =========================
   CONFIG MERCADO PAGO (lazy)
========================= */
const getMpClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN não definida");
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });
};

/* =========================
   VALIDATION
========================= */
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

/* =========================
   STRIPE CHECKOUT
========================= */
export const createCheckoutSession = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { items } = value;

    const products = await Product.find({
      _id: { $in: items.map((i) => i.productId) },
    });

    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error("Produto não encontrado");

      return {
        product: p._id,
        name: p.name,
        price: Number(p.price),
        quantity: i.quantity,
      };
    });

    const total = orderItems.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      status: "pending_payment",
      paymentProvider: "stripe",
    });

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      mode: "payment",
      line_items: orderItems.map((i) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: i.name,
          },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[STRIPE ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================
   MERCADO PAGO CHECKOUT
========================= */
export const createMercadoPagoPreference = async (req, res) => {
  console.log("CLIENT_URL:", process.env.CLIENT_URL);
  try {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { items } = value;

    const products = await Product.find({
      _id: { $in: items.map((i) => i.productId) },
    });

    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error("Produto não encontrado");

      return {
        product: p._id,
        name: p.name,
        price: Number(p.price),
        quantity: i.quantity,
      };
    });

    const total = orderItems.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      status: "pending_payment",
      paymentProvider: "mercadopago",
    });

    const preference = new Preference(getMpClient()); // 👈 lazy, lê o .env na hora certa

    const response = await preference.create({
      body: {
        items: orderItems.map((i) => ({
          title: i.name,
          quantity: i.quantity,
          currency_id: "BRL",
          unit_price: i.price,
        })),

        back_urls: {
          success: `${process.env.CLIENT_URL}/success`,
          failure: `${process.env.CLIENT_URL}/cancel`,
          pending: `${process.env.CLIENT_URL}/pending`,
        },
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" }, // boleto
          ],
        },

        external_reference: order._id.toString(),

        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id,
        },
      },
    });

    if (!response?.init_point) {
      throw new Error("Mercado Pago não retornou URL");
    }

    order.mercadoPagoPreferenceId = response.id;
    await order.save();

    return res.json({
      url: response.init_point,
    });
  } catch (err) {
    console.error("[MP ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================
   WEBHOOK (STRIPE + BASE FUTURA MP)
========================= */
export const handleWebhook = async (req, res) => {
  try {
    console.log("📩 WEBHOOK RECEBIDO");

    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).json({ error: "Missing stripe signature" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId = session.metadata.orderId;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "Invalid orderId" });
      }

      const order = await Order.findById(orderId);

      if (order && order.status !== "paid") {
        order.status = "paid";
        order.paidAt = new Date();
        await order.save();

        console.log("✅ Pedido pago:", orderId);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    return res.status(500).json({ error: "Webhook failed" });
  }
};