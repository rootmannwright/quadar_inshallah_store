import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ==========================
// IDENTIFICAR CARRINHO
// ==========================
async function findCart(identifier) {
  // tenta como usuário
  let cart = await Cart.findOne({ user: identifier }).populate("items.product");

  if (!cart) {
    // tenta como sessão
    cart = await Cart.findOne({ sessionId: identifier }).populate("items.product");
  }

  return cart;
}

// ==========================
// CRIAR CARRINHO
// ==========================
async function createCart(identifier) {
  const isObjectId = identifier.length === 24;

  const cart = await Cart.create({
    user: isObjectId ? identifier : null,
    sessionId: isObjectId ? null : identifier,
    items: [],
  });

  return cart;
}

// ==========================
// GET CART
// ==========================
export async function getCart(identifier) {
  let cart = await findCart(identifier);

  if (!cart) {
    cart = await createCart(identifier);
  }

  return cart;
}

// ==========================
// ADD TO CART
// ==========================
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
    (item) => item.product.toString() === productId
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

// ==========================
// REMOVE ITEM
// ==========================
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

// ==========================
// CLEAR CART
// ==========================
export async function clearCart(identifier) {
  const cart = await findCart(identifier);

  if (!cart) {
    throw new Error("Carrinho não encontrado");
  }

  cart.items = [];
  await cart.save();

  return cart;
}