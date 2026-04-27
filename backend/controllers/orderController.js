import mongoose from "mongoose";
import { z } from "zod";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const cartItemSchema = z.object({
  productId: z
    .string({ required_error: "productId é obrigatório" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "productId inválido",
    }),
  quantity: z
    .number({ required_error: "quantity é obrigatório" })
    .int("quantity deve ser inteiro")
    .min(1, "quantity mínimo é 1")
    .max(999, "quantity máximo é 999"),
});

const createOrderSchema = z.object({
  cart: z
    .array(cartItemSchema, { required_error: "cart é obrigatório" })
    .min(1, "Cart não pode estar vazio")
    .max(100, "Cart excede o limite de itens"),
});

const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createOrder = async (req, res, next) => {
  try {
    const result = createOrderSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Dados inválidos";
      return res.status(400).json({ error: message });
    }

    const { cart } = result.data;

    const mergedCart = Object.values(
      cart.reduce((acc, item) => {
        if (acc[item.productId]) {
          acc[item.productId].quantity += item.quantity;
        } else {
          acc[item.productId] = { ...item };
        }
        return acc;
      }, {})
    );

    const productIds = mergedCart.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let total = 0;

    for (const item of mergedCart) {
      const product = productMap.get(item.productId);

      if (!product || !product.active) {
        return res.status(404).json({
          error: `Produto não encontrado ou inativo: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(409).json({
          error: `Estoque insuficiente para: ${product.name}`,
        });
      }

      orderItems.push({
        product:  product._id,
        name:     product.name,   // snapshot do nome no momento da compra
        price:    product.price,  // snapshot do preço no momento da compra
        quantity: item.quantity,
      });

      total += product.price * item.quantity;
    }

    const session = await mongoose.startSession();
    let order;

    try {
      await session.withTransaction(async () => {
        [order] = await Order.create(
          [{ user: req.user.id, items: orderItems, total, status: "pending_payment" }],
          { session }
        );

        await Promise.all(
          orderItems.map((item) =>
            Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } },
              { session }
            )
          )
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name imageUrl")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    return res.json(order);
  } catch (err) {
    return next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Parâmetros inválidos";
      return res.status(400).json({ error: message });
    }

    const { page, limit } = result.data;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name imageUrl")
        .lean(),
      Order.countDocuments({ user: req.user.id }),
    ]);

    return res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    return next(err);
  }
};