import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Joi from "joi";

/* =========================
   🔒 VALIDATION SCHEMAS
========================= */

const addToCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  qty: Joi.number().integer().min(1).default(1),
});

const productParamSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

/* =========================
   🧠 HELPERS
========================= */

function getIdentifier(req) {
  if (req.user?.id) {
    return { type: "user", value: String(req.user.id) };
  }

  const sessionId =
    req.cookies?.sessionId ||
    req.headers["x-session-id"] ||
    null;

  if (sessionId) {
    return { type: "session", value: String(sessionId) };
  }

  return null;
}

async function findCart(identifier) {
  if (!identifier) return null;

  const query =
    identifier.type === "user"
      ? { user: identifier.value }
      : { sessionId: identifier.value };

  return Cart.findOne(query).populate("items.product");
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

/* =========================
   📦 RESPONSE HELPERS
========================= */

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const sendSuccess = (res, data) =>
  res.status(200).json({
    success: true,
    ...data,
  });

/* =========================
   🛒 CONTROLLERS
========================= */

export async function getCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendSuccess(res, { cart: { items: [] } });
    }

    const cart = await findOrCreateCart(identifier);
    await cart.populate("items.product");

    return sendSuccess(res, { cart });
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

    // 🔒 validação segura
    const { error, value } = addToCartSchema.validate(req.body);

    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    const { productId, qty } = value;

    // 🔒 valida ObjectId extra (defensivo)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, 400, "productId inválido");
    }

    const safeProductId = String(productId);

    const product = await Product.findById(safeProductId);

    if (!product) {
      return sendError(res, 404, "Produto não encontrado");
    }

    if (product.stock !== undefined && product.stock < qty) {
      return sendError(res, 400, "Estoque insuficiente");
    }

    const cart = await findOrCreateCart(identifier);

    const existing = cart.items.find(
      (i) => i.product?.toString() === safeProductId
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        product: safeProductId,
        qty,
      });
    }

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess(res, { cart });
  } catch (err) {
    console.error("[ADD TO CART]", err);
    return sendError(res, 500, "Erro ao adicionar ao carrinho");
  }
}

export async function removeFromCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendError(res, 400, "Sessão não identificada");
    }

    const { error, value } = productParamSchema.validate(req.params);

    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    const { productId } = value;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, 400, "productId inválido");
    }

    const cart = await findCart(identifier);

    if (!cart) {
      return sendError(res, 404, "Carrinho não encontrado");
    }

    cart.items = cart.items.filter(
      (i) =>
        i.product?._id?.toString() !== productId &&
        i.product?.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess(res, { cart });
  } catch (err) {
    console.error("[REMOVE FROM CART]", err);
    return sendError(res, 500, "Erro ao remover item");
  }
}

export async function clearCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendError(res, 401, "Não autorizado");
    }

    const cart = await findCart(identifier);

    if (!cart) {
      return sendError(res, 404, "Carrinho não encontrado");
    }

    cart.items = [];
    await cart.save();

    return sendSuccess(res, { cart });
  } catch (err) {
    console.error("[CLEAR CART]", err);
    return sendError(res, 500, "Erro ao limpar carrinho");
  }
}

/* =========================
   🔄 MERGE CART
========================= */

export async function mergeGuestCart(userId, sessionId) {
  try {
    if (!sessionId || !mongoose.Types.ObjectId.isValid(userId)) return;

    const guestCart = await Cart.findOne({ sessionId }).populate("items.product");

    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          i.product?.toString() === guestItem.product?._id?.toString()
      );

      if (existing) {
        existing.qty += guestItem.qty;
      } else {
        userCart.items.push({
          product: guestItem.product._id,
          qty: guestItem.qty,
        });
      }
    }

    await userCart.save();

    guestCart.items = [];
    await guestCart.save();
  } catch (err) {
    console.error("[MERGE CART]", err);
  }
}