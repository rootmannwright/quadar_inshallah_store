// backend/controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Retorna o identificador correto:

function getIdentifier(req) {
  if (req.user?.id) return { type: "user", value: req.user.id };

  const sessionId =
    req.cookies?.sessionId ||
    req.headers["x-session-id"] ||
    null;

  if (sessionId) return { type: "session", value: sessionId };

  return null;
}

async function findCart(identifier) {
  if (!identifier) return null;

  if (identifier.type === "user") {
    return Cart.findOne({ user: identifier.value }).populate("items.product");
  }

  return Cart.findOne({ sessionId: identifier.value }).populate("items.product");
}

async function findOrCreateCart(identifier) {
  let cart = await findCart(identifier);
  if (!cart) {
    cart = await Cart.create(
      identifier.type === "user"
        ? { user: identifier.value, items: [] }
        : { sessionId: identifier.value, items: [] }
    );
  }
  return cart;
}

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const sendSuccess = (res, data) =>
  res.status(200).json({ success: true, ...data });

export async function getCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendSuccess(res, { cart: { items: [] } });
    }

    const cart = await findOrCreateCart(identifier);
    const populated = await cart.populate("items.product");

    return sendSuccess(res, { cart: populated });
  } catch (err) {
    console.error("[GET CART]", err);
    return sendError(res, 500, "Erro ao buscar carrinho");
  }
}

export async function addToCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendError(res, 400, "Sessão não identificada");
    }

    const { productId, qty = 1 } = req.body;

    if (!productId) return sendError(res, 400, "productId é obrigatório");

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 404, "Produto não encontrado");

    if (product.stock !== undefined && product.stock < qty) {
      return sendError(res, 400, "Estoque insuficiente");
    }

    const cart = await findOrCreateCart(identifier);

    const existing = cart.items.find(
      (i) => i.product && i.product.toString() === productId
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }

    await cart.save();
    const populated = await cart.populate("items.product");

    return sendSuccess(res, { cart: populated });
  } catch (err) {
    console.error("[ADD TO CART]", err);
    return sendError(res, 500, "Erro ao adicionar ao carrinho");
  }
}

export async function removeFromCartController(req, res) {
  try {
    const identifier = getIdentifier(req);
    if (!identifier) return sendError(res, 400, "Sessão não identificada");

    const { productId } = req.params;
    const cart = await findCart(identifier);

    if (!cart) return sendError(res, 404, "Carrinho não encontrado");

    cart.items = cart.items.filter(
      (i) => i.product?._id?.toString() !== productId && i.product?.toString() !== productId
    );

    await cart.save();
    const populated = await cart.populate("items.product");

    return sendSuccess(res, { cart: populated });
  } catch (err) {
    console.error("[REMOVE FROM CART]", err);
    return sendError(res, 500, "Erro ao remover item");
  }
}

// Only logged users.
export async function clearCartController(req, res) {
  try {
    const identifier = getIdentifier(req);
    if (!identifier) return sendError(res, 401, "Não autorizado");

    const cart = await findCart(identifier);
    if (!cart) return sendError(res, 404, "Carrinho não encontrado");

    cart.items = [];
    await cart.save();

    return sendSuccess(res, { cart });
  } catch (err) {
    console.error("[CLEAR CART]", err);
    return sendError(res, 500, "Erro ao limpar carrinho");
  }
}

// Function to merge guest cart into user cart after login.
export async function mergeGuestCart(userId, sessionId) {
  if (!sessionId) return;

  const guestCart = await Cart.findOne({ sessionId }).populate("items.product");
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) {
    userCart = await Cart.create({ user: userId, items: [] });
  }

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find(
      (i) => i.product?.toString() === guestItem.product?._id?.toString()
    );
    if (existing) {
      existing.qty += guestItem.qty;
    } else {
      userCart.items.push({ product: guestItem.product._id, qty: guestItem.qty });
    }
  }

  await userCart.save();

  guestCart.items = [];
  await guestCart.save();
}