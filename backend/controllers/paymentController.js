import Stripe from "stripe";
import Joi from "joi";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// 🔐 Stripe factory
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("❌ STRIPE_SECRET_KEY não definida no .env");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Validate URL images before sendint to Stripe
const isValidImageUrl = (url) => {
  try {
    // eslint-disable-next-line no-undef
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

// Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    console.log("🛒 BODY RECEBIDO:", req.body);

    // ✅ Validação
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
      console.log("❌ ERRO VALIDAÇÃO:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { items } = value;

    // Validate user after validation of body
    if (!req.user?.id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const ids = [...new Set(items.map((i) => i.productId))];

    const products = await Product.find({ _id: { $in: ids } });

    console.log("📦 PRODUTOS ENCONTRADOS:", products.length);

    if (!products.length) {
      return res.status(404).json({ error: "Products not found" });
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Produto não encontrado: ${item.productId}`);
      }

      const price = Number(product.price);

      if (!price || isNaN(price)) {
        throw new Error(`Preço inválido: ${product.name}`);
      }

      return {
        product: product._id,
        name: product.name,
        image: product.image || null,
        price,
        quantity: item.quantity,
      };
    });

    // Image logs
    console.log("🖼️ IMAGENS:", orderItems.map((i) => i.image));
    console.log("🧾 ORDER ITEMS:", orderItems);

    const total = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    console.log("💰 TOTAL:", total);

    const CLIENT_URL = process.env.CLIENT_URL;

    console.log("🌐 CLIENT_URL:", CLIENT_URL);

    if (!CLIENT_URL || !CLIENT_URL.startsWith("http")) {
      throw new Error("CLIENT_URL inválida no .env");
    }

    // Create order with status "pending_payment"
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      status: "pending_payment", //
    });

    console.log("📄 ORDER CRIADA:", order._id);

    const stripe = getStripe();

    const line_items = orderItems.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.name,
          images:
            item.image && isValidImageUrl(item.image) ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    console.log("💳 LINE ITEMS:", line_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      mode: "payment",
      line_items,
      success_url: `${CLIENT_URL}/success`,
      cancel_url: `${CLIENT_URL}/cancel`,
      metadata: {
        name: `Pedido ${order._id}`,
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    console.log("🔥 STRIPE SESSION:", session);

    if (!session.url) {
      throw new Error("Stripe não retornou URL");
    }

    order.stripeSessionId = session.id;
    await order.save();

    console.log("✅ CHECKOUT OK, REDIRECT:", session.url);

    return res.json({ url: session.url });
  } catch (err) {
    console.error("🔥 CHECKOUT ERROR COMPLETO:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Webhook handler
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
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) break;

        const order = await Order.findById(orderId);
        if (!order) break;

        if (order.status === "payment_intent_paid") break;

        order.status = "payment_intent_paid";
        order.paidAt = new Date();

        await order.save();

        console.log("✅ Pedido pago:", orderId);
        break;
      }

      default:
        console.log("⚠️ Evento não tratado:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err.message);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};