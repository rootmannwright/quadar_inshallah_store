import mongoose from "mongoose";
import { z } from "zod";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "ID inválido",
  });

const sessionIdSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[\w-]+$/, "sessionId com caracteres inválidos");

const addToCartSchema = z.object({
  productId: objectIdSchema,
  qty: z.number({ required_error: "qty é obrigatório" }).int().min(1).max(999).default(1),
});

const productParamSchema = z.object({
  productId: objectIdSchema,
});

function getIdentifier(req) {
  if (req.user?.id) {
    return { type: "user", value: String(req.user.id) };
  }

  const rawSessionId =
    req.cookies?.sessionId ?? req.headers["x-session-id"] ?? null;

  if (!rawSessionId) return null;

  const parsed = sessionIdSchema.safeParse(rawSessionId);
  if (!parsed.success) return null;

  return { type: "session", value: parsed.data };
}

function buildQuery(identifier) {
  return identifier.type === "user"
    ? { user: identifier.value }
    : { sessionId: identifier.value };
}

async function findCart(identifier) {
  return Cart.findOne(buildQuery(identifier)).populate("items.product");
}

async function findOrCreateCart(identifier) {
  const existing = await Cart.findOne(buildQuery(identifier));
  if (existing) return existing;

  return Cart.create({ ...buildQuery(identifier), items: [] });
}

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, ...data });

export async function getCartController(req, res) {
  try {
    const identifier = getIdentifier(req);

    if (!identifier) {
      return sendSuccess(res, { cart: { items: [] } });
    }
    const cart = await findCart(identifier);

    return sendSuccess(res, { cart: cart ?? { items: [] } });
  } catch (err) {
    console.error("[GET /cart]", err);
    return sendError(res, 500, "Erro ao buscar carrinho");
  }
}

export async function addToCartController(req, res) {
  try {
    const identifier = getIdentifier(req);
    if (!identifier) {
      return sendError(res, 400, "Sessão não identificada");
    }

    const result = addToCartSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      return sendError(res, 400, message);
    }

    const { productId, qty } = result.data;

    const product = await Product.findById(productId).lean();
    if (!product) {
      return sendError(res, 404, "Produto não encontrado");
    }

    if (product.stock !== undefined && product.stock < qty) {
      return sendError(res, 409, "Estoque insuficiente");
    }

    const cart = await findOrCreateCart(identifier);

    const existing = cart.items.find(
      (i) => i.product?.toString() === productId
    );

    if (existing) {
      const newQty = existing.qty + qty;
      if (product.stock !== undefined && product.stock < newQty) {
        return sendError(res, 409, "Estoque insuficiente para a quantidade solicitada");
      }
      existing.qty = newQty;
    } else {
      cart.items.push({ product: productId, qty });
    }

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess(res, { cart }, 200);
  } catch (err) {
    console.error("[POST /cart/items]", err);
    return sendError(res, 500, "Erro ao adicionar ao carrinho");
  }
}

export async function removeFromCartController(req, res) {
  try {
    const identifier = getIdentifier(req);
    if (!identifier) {
      return sendError(res, 400, "Sessão não identificada");
    }

    const result = productParamSchema.safeParse(req.params);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Parâmetro inválido";
      return sendError(res, 400, message);
    }

    const { productId } = result.data;

    const cart = await findCart(identifier);
    if (!cart) {
      return sendError(res, 404, "Carrinho não encontrado");
    }

    const sizeBefore = cart.items.length;
    cart.items = cart.items.filter(
      (i) => (i.product?._id ?? i.product)?.toString() !== productId
    );

    if (cart.items.length === sizeBefore) {
      return sendError(res, 404, "Produto não encontrado no carrinho");
    }

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess(res, { cart });
  } catch (err) {
    console.error("[DELETE /cart/items/:productId]", err);
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
    console.error("[DELETE /cart]", err);
    return sendError(res, 500, "Erro ao limpar carrinho");
  }
}

export async function mergeGuestCart(userId, sessionId) {
  if (!sessionId || !mongoose.Types.ObjectId.isValid(userId)) return;

  const parsedSession = sessionIdSchema.safeParse(sessionId);
  if (!parsedSession.success) return;

  try {
    const guestCart = await Cart.findOne({
      sessionId: parsedSession.data,
    }).populate("items.product");

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, items: [] } },
      { upsert: true, new: true }
    );

    for (const guestItem of guestCart.items) {
      const guestProductId = guestItem.product?._id?.toString();
      if (!guestProductId) continue;

      const existing = userCart.items.find(
        (i) => i.product?.toString() === guestProductId
      );

      if (existing) {
        existing.qty += guestItem.qty;
      } else {
        userCart.items.push({ product: guestProductId, qty: guestItem.qty });
      }
    }

    await Promise.all([
      userCart.save(),
      Cart.deleteOne({ sessionId: parsedSession.data }),
    ]);
  } catch (err) {
    console.error("[MERGE CART]", err);
  }
}