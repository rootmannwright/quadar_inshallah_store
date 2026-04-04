export const getCartWithTotal = async (userId) => {
  const cart = await cart.findOne({ user: userId }).populate("items.product");

  if (!cart) return { items: [], total: 0 };

  let total = 0;

  cart.items.forEach((item) => {
    total += item.product.price * item.quantity;
  });

  return { ...cart.toObject(), total };
};

export const addToCartSafe = async (userId, { productId, quantity = 1 }) => {
  const product = await product.findById(productId);
  if (!product) throw { status: 404, message: "Produto não encontrado." };

  if (product.stock < quantity) {
    throw { status: 400, message: "Estoque insuficiente." };
  }

  let cart = await cart.findOne({ user: userId });
  if (!cart) cart = await cart.create({ user: userId, items: [] });

  const index = cart.items.findIndex(i => i.product.toString() === productId);

  if (index > -1) {
    const newQty = cart.items[index].quantity + quantity;

    if (product.stock < newQty) {
      throw { status: 400, message: "Quantidade excede estoque." };
    }

    cart.items[index].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart;
};