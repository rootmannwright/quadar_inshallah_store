import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutService = async (userId) => {
  const cart = await cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw { status: 400, message: "Carrinho vazio." };
  }

  const line_items = cart.items.map((item) => {
    if (item.product.stock < item.quantity) {
      throw { status: 400, message: `Sem estoque para ${item.product.name}` };
    }

    return {
      price_data: {
        currency: "brl",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  return { url: session.url };
};
