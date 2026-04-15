// services/cartService.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Find cart by user ID or session ID
async function findCart(identifier) {
  let cart = await Cart.findOne({ user: identifier }).populate("items.product");

  if (!cart) {
    cart = await Cart.findOne({ sessionId: identifier }).populate("items.product");
  }

  return cart;
}

// Create new cart for user or session
async function createCart(identifier) {
  const isObjectId = identifier.length === 24;

  const cart = await Cart.create({
    user: isObjectId ? identifier : null,
    sessionId: isObjectId ? null : identifier,
    items: [],
  });

  return cart;
}

export async function getCart(identifier, token) {
  let cart = await findCart(identifier, token);
  // Temporary token.
  if (!cart) {
    cart = await createCart(identifier, token);
  }

  return cart;
}

export async function addToCart(identifier, body) {
  const { productId, qty = 1 } = body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Produto não encontrado");
  }

  if (product.stock !== undefined && product.stock < qty) {
    throw new Error("Estoque insuficiente");
  }

  let cart = await findCart(identifier);

  if (!cart) {
    cart = await createCart(identifier);
  }

  const existingItem = cart.items.find(
    (item) => item.product && item.product._id.toString() === productId
  );

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.items.push({
      product: productId,
      qty,
    });
  }

  await cart.save();

  return await cart.populate("items.product");
}

export async function removeFromCart(identifier, productId) {
  const cart = await findCart(identifier);

  if (!cart) {
    throw new Error("Carrinho não encontrado");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  return await cart.populate("items.product");
}

export async function clearCart(identifier) {
  const cart = await findCart(identifier);

  if (!cart) {
    throw new Error("Carrinho não encontrado");
  }

  cart.items = [];
  await cart.save();

  return cart;
}