// controller/orderController.js
import Joi from "joi";
import mongoose from "mongoose";
import Order from "../models/Order.js"; 
import Product from "../models/Product.js";

export const createOrder = async (req, res, next) => {
  try {
    const { cart } = req.body;

    // Basic validation
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    let items = [];
    let total = 0;

    for (const item of cart) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: "Invalid cart item" });
      }

      const schema = Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      });
      if(!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: "Invalid product ID format" });
      }

      const { error, value } = schema.validate(item);
      if (error) {
        return res.status(400).json({ error: "Invalid cart item", details: error.details });
      }
      const product = await Product.findById(value.productId);

      if (!product || !product.active) {
        return res.status(400).json({ error: "Invalid product" });
      }

      if (product.stock < value.quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }

      items.push({
        product: product._id,
        quantity: value.quantity,
        price: product.price
      });

      total += product.price * value.quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      status: "pending_payment"
    });

    return res.status(201).json(order);

  } catch (err) {
    return next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

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
    const orders = await Order.find({ user: req.user.id });
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};