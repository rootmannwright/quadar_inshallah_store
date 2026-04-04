import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../services/cartService.js";

const cartRouter = express.Router();

cartRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

cartRouter.post("/add", authMiddleware, async (req, res, next) => {
  try {
    const cart = await addToCart(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

cartRouter.delete("/remove/:productId", authMiddleware, async (req, res, next) => {
  try {
    const cart = await removeFromCart(req.user.id, req.params.productId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

cartRouter.delete("/clear", authMiddleware, async (req, res, next) => {
  try {
    const cart = await clearCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

export default cartRouter;
