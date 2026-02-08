const Order = require("../models/Order.js");

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    const order = new Order({
      items,
      total,
      status: "pendente"
    });

    await order.save();

    res.status(201).json({
      message: "Pedido criado com sucesso",
      order
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar pedido"
    });
  }
};
