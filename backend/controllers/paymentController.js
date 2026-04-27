import Stripe from "stripe";
import { MercadoPagoConfig, Preference } from "mercadopago";
import mongoose from "mongoose";
import { z } from "zod";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("STRIPE_SECRET_KEY não definida");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });
};

const getMpClient = () => {
  if (!process.env.MP_ACCESS_TOKEN)
    throw new Error("MP_ACCESS_TOKEN não definida");
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
};

const cartItemSchema = z.object({
  productId: z
    .string({ required_error: "productId é obrigatório" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "productId inválido",
    }),
  quantity: z
    .number({ required_error: "quantity é obrigatório" })
    .int("quantity deve ser inteiro")
    .min(1, "quantity mínimo é 1")
    .max(999, "quantity máximo é 999"),
});

const checkoutSchema = z.object({
  items: z
    .array(cartItemSchema, { required_error: "items é obrigatório" })
    .min(1, "items não pode estar vazio")
    .max(100, "items excede o limite permitido"),
});

const validateRequest = (req, res) => {
  const result = checkoutSchema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Dados inválidos";
    res.status(400).json({ error: message });
    return null;
  }
  if (!req.user?.id) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return null;
  }
  return result.data;
};

const buildOrder = async (items, userId, paymentProvider) => {
  const productIds = items.map((i) => i.productId);

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = items.map((i) => {
    const p = productMap.get(i.productId);

    if (!p || !p.active)
      throw Object.assign(
        new Error(`Produto não encontrado ou inativo: ${i.productId}`),
        { statusCode: 404 }
      );

    if (p.stock !== undefined && p.stock < i.quantity)
      throw Object.assign(
        new Error(`Estoque insuficiente para: ${p.name}`),
        { statusCode: 409 }
      );

    return {
      product:  p._id,
      name:     p.name,   // snapshot do nome no momento da compra
      price:    Number(p.price),
      quantity: i.quantity,
    };
  });

  const total = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
    status: "pending_payment",
    paymentProvider,
  });

  return { order, orderItems };
};

export const createCheckoutSession = async (req, res) => {
  try {
    const value = validateRequest(req, res);
    if (!value) return;

    const { order, orderItems } = await buildOrder(value.items, req.user.id, "stripe");

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      mode: "payment",
      line_items: orderItems.map((i) => ({
        price_data: {
          currency: "brl",
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url:  `${process.env.CLIENT_URL}/cancel`,
      expires_at:  Math.floor(Date.now() / 1000) + 30 * 60, // expira em 30 min
      metadata: {
        orderId: order._id.toString(),
        userId:  req.user.id,
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.status(201).json({ url: session.url });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[STRIPE ERROR]", err);
    return res.status(500).json({ error: "Erro ao criar sessão de pagamento" });
  }
};

export const createMercadoPagoPreference = async (req, res) => {
  try {
    const value = validateRequest(req, res);
    if (!value) return;

    const { order, orderItems } = await buildOrder(value.items, req.user.id, "mercadopago");

    const preference = new Preference(getMpClient());

    const response = await preference.create({
      body: {
        items: orderItems.map((i) => ({
          title:       i.name,
          quantity:    i.quantity,
          currency_id: "BRL",
          unit_price:  i.price,
        })),
        back_urls: {
          success: `${process.env.CLIENT_URL}/success`,
          failure: `${process.env.CLIENT_URL}/cancel`,
          pending: `${process.env.CLIENT_URL}/pending`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
          ],
        },
        external_reference: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          userId:  req.user.id,
        },
      },
    });

    if (!response?.init_point)
      throw new Error("Mercado Pago não retornou URL de pagamento");

    order.mercadoPagoPreferenceId = response.id;
    await order.save();

    return res.status(201).json({ url: response.init_point });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[MP ERROR]", err);
    return res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    if (!sig)
      return res.status(400).json({ error: "Missing stripe-signature header" });

    if (!process.env.STRIPE_WEBHOOK_SECRET)
      throw new Error("STRIPE_WEBHOOK_SECRET não definida");

    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // FIX XSS (CodeQL js/xss-through-exception):
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
          console.error("❌ orderId inválido no metadata:", orderId);
          return res.status(400).json({ error: "Invalid orderId in metadata" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
          console.error("❌ Pedido não encontrado:", orderId);
          return res.status(404).json({ error: "Order not found" });
        }

        if (order.status !== "paid") {
          order.status = "paid";
          order.paidAt = new Date();
          order.stripePaymentIntentId = session.payment_intent ?? null;
          await order.save();
          console.log("✅ Pedido pago:", orderId);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
          await Order.findOneAndUpdate(
            { _id: orderId, status: "pending_payment" },
            { status: "cancelled" }
          );
          console.log("🕒 Sessão expirada, pedido cancelado:", orderId);
        }
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};