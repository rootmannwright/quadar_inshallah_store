// backend/routes/cartRoutes.js
import express from "express";
const router = express.Router();

// ==========================
// GET CART
// ==========================
router.get("/", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  res.json({ items: req.session.cart });
});

// ==========================
// ADD ITEM
// ==========================
router.post("/add", (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty) return res.status(400).json({ error: "Produto ou quantidade inválidos" });

  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) existing.qty += qty;
  else req.session.cart.push({ productId, qty });

  res.json({ success: true, items: req.session.cart });
});

// ==========================
// REMOVE ITEM
// ==========================
router.delete("/remove/:productId", (req, res) => {
  const { productId } = req.params;
  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.filter(item => item.productId !== productId);

  res.json({ success: true, items: req.session.cart });
});

export default router;