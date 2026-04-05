// routes/cartRoutes.js
import express from "express";

const router = express.Router();

// Middleware para inicializar o carrinho
router.use((req, res, next) => {
  if (!req.session) {
    return res.status(500).json({ error: "Sessão não inicializada. Verifique se express-session está configurado." });
  }
  if (!req.session.cart) req.session.cart = [];
  next();
});

// GET /api/cart - retorna o carrinho atual
router.get("/", (req, res) => {
  try {
    res.json(req.session.cart);
  } catch (err) {
    console.error("Erro ao obter carrinho:", err);
    res.status(500).json({ error: "Não foi possível carregar o carrinho" });
  }
});

// POST /api/cart/add - adiciona ou atualiza item no carrinho
router.post("/add", (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (!productId || qty === undefined) {
      return res.status(400).json({ error: "Faltando productId ou qty" });
    }

    const existing = req.session.cart.find(item => item.productId === productId);
    if (existing) {
      existing.qty = qty;
    } else {
      req.session.cart.push({ productId, qty });
    }

    res.json(req.session.cart);
  } catch (err) {
    console.error("Erro ao adicionar item ao carrinho:", err);
    res.status(500).json({ error: "Não foi possível adicionar item ao carrinho" });
  }
});

// DELETE /api/cart/remove/:id - remove item do carrinho
router.delete("/remove/:id", (req, res) => {
  try {
    const { id } = req.params;
    req.session.cart = req.session.cart.filter(item => item.productId !== id);
    res.json(req.session.cart);
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    res.status(500).json({ error: "Não foi possível remover item do carrinho" });
  }
});

export default router;