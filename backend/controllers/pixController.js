import pkg from "mercadopago";
const { configure, payment } = pkg;

import Product from "../models/Product.js";

const initMP = () => {
  configure({ access_token: process.env.MP_ACCESS_TOKEN });
};

const buildItems = async (items) => {
  const products = await Product.find({
    _id: { $in: items.map((i) => i.productId) },
  });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  return items.map((i) => {
    const p = map.get(i.productId);
    if (!p) throw new Error("Produto não encontrado");
    return {
      name: p.name,
      price: Number(p.price),
      quantity: Number(i.quantity),
    };
  });
};

export const createPixPayment = async (req, res) => {
  try {
    initMP();

    const { items, payer } = req.body;

    if (!payer?.email || !payer?.firstName || !payer?.lastName || !payer?.identificationNumber) {
      return res.status(400).json({ error: "Dados do pagador incompletos" });
    }

    const sanitized = await buildItems(items);
    const total = sanitized.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const response = await payment.create({
      transaction_amount: Number(total.toFixed(2)),
      description: "Quadar Store",
      payment_method_id: "pix",
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        last_name: payer.lastName,
        identification: {
          type: payer.identificationType || "CPF",
          number: payer.identificationNumber.replace(/\D/g, ""),
        },
      },
    });

    const txData = response.body?.point_of_interaction?.transaction_data;

    if (!txData?.qr_code) {
      throw new Error("PIX não retornou QR code");
    }

    return res.json({
      paymentId: response.body.id,
      qrCode: txData.qr_code,
      qrCodeBase64: txData.qr_code_base64,
      total,
    });
  } catch (err) {
    console.error("[PIX ERROR]", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const getPixStatus = async (req, res) => {
  try {
    initMP();
    const { paymentId } = req.params;
    const response = await payment.get(paymentId);
    return res.json({ status: response.body.status });
  } catch (err) {
    console.error("[PIX STATUS ERROR]", err.message);
    return res.status(500).json({ error: err.message });
  }
};