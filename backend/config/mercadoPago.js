import { MercadoPagoConfig, Preference } from "mercadopago";

const getMpClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN não definida");
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });
};

export const createMercadoPagoPreference = async (req, res) => {
  try {
    const { items } = req.body;

    const preference = new Preference(getMpClient());

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.title || item.productId,
          quantity: Number(item.quantity),
          currency_id: "BRL",
          unit_price: Number(item.unit_price),
        })),

        back_urls: {
          success: `${process.env.CLIENT_URL}/success`,
          failure: `${process.env.CLIENT_URL}/cancel`,
          pending: `${process.env.CLIENT_URL}/pending`,
        },

        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 12,
        },

        auto_return: "approved",
      },
    });

    return res.json({
      url: result.init_point,
      id: result.id,
    });
  } catch (err) {
    console.error("🔥 MP ERROR:", err);
    return res.status(500).json({ error: "Erro ao criar preferência Mercado Pago" });
  }
};