// ================= IMPORTS =================
import Order from "../models/Order.js"; 
import Product from "../models/Product.js";

// ================= CREATE ORDER =================
export const createOrder = async (req, res, next) => {
  try {
    const { cart } = req.body;

    let items = [];
    let total = 0;

    // verify products and calculate total
    for (const item of cart) {
      const product = await Product.findById(item.productId);

      if (!product || !product.active) {
        return res.status(400).json({ error: "Produto inválido" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: "Estoque insuficiente" });
      }

      items.push({
        productId: product._id,
        qty: item.quantity,
        price: product.price
      });

      total += product.price * item.quantity;
    }

    // create order pending (don't reduce stock yet)
    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: "pending"
    });

    return res.status(201).json(order); // return added
  } catch (err) {
    return next(err); // return added for consistent-return
  }
};

// ================= GET ORDER BY ID =================
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    return res.json(order);
  } catch (err) {
    return next(err); // return added
  }
};

// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    return res.json(orders);
  } catch (err) {
    return next(err); // return added
  }
};