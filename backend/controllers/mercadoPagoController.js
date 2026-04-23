import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import Product from "../models/Product.js";

/* =========================
   CLIENT LAZY (🔥 CORRETO)
========================= */
const getClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN não definida");
  }

  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });
};

/* =========================
   BUILD ITEMS
========================= */
const buildItemsFromDB = async (items) => {
  const products = await Product.find({
    _id: { $in: items.map((i) => i.productId) },
  });

  const map = new Map(products.map((p) => [p._id.toString(), p]));

  return items.map((i) => {
    const product = map.get(i.productId);

    if (!product) throw new Error("Produto não encontrado");

    return {
      title: product.name,
      quantity: Number(i.quantity),
      unit_price: Number(product.price),
      currency_id: "BRL",
    };
  });
};

/* =========================
   CHECKOUT PRO
========================= */
export const createMercadoPagoPreference = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items?.length) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    const sanitizedItems = await buildItemsFromDB(items);

    const baseUrl =
      process.env.CLIENT_URL?.trim() || "http://localhost:5173";

    const preference = new Preference(getClient());

    const response = await preference.create({
      body: {
        items: sanitizedItems,

        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/cancel`,
          pending: `${baseUrl}/pending`,
        },

        // ⚠️ se der erro aqui, comenta essa linha
        auto_return: "approved",

        payment_methods: {
          installments: 12,
        },

        statement_descriptor: "QUADAR STORE",
      },
    });

    if (!response?.init_point) {
      throw new Error("Mercado Pago não retornou init_point");
    }

    return res.json({
      url: response.init_point,
    });
  } catch (err) {
    console.error("❌ [MP ERROR]", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

/* =========================
   PIX (QR CODE)
========================= */
export const createPixPayment = async (req, res) => {
  try {
    const { items, payer } = req.body;

    if (!items?.length) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    if (!payer?.email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const sanitizedItems = await buildItemsFromDB(items);

    const total = sanitizedItems.reduce(
      (acc, i) => acc + i.unit_price * i.quantity,
      0
    );

    const payment = new Payment(getClient());

    const response = await payment.create({
      body: {
        transaction_amount: Number(total.toFixed(2)),
        description: "Quadar Store",
        payment_method_id: "pix",

        payer: {
          email: payer.email,
          first_name: payer.firstName,
          last_name: payer.lastName,
          identification: {
            type: payer.identificationType || "CPF",
            number: payer.identificationNumber?.replace(/\D/g, ""),
          },
        },
      },
    });

    const pix = response.point_of_interaction?.transaction_data;

    if (!pix?.qr_code) {
      throw new Error("Pix não retornou QR Code");
    }

    return res.json({
      paymentId: response.id,
      qrCode: pix.qr_code,
      qrCodeBase64: pix.qr_code_base64,
      total,
    });
  } catch (err) {
    console.error("❌ [PIX ERROR]", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

/* =========================
   STATUS PIX
========================= */
export const getPixStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = new Payment(getClient());

    const result = await payment.get({
      id: paymentId,
    });

    return res.json({
      status: result.status,
    });
  } catch (err) {
    console.error("❌ [PIX STATUS ERROR]", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};