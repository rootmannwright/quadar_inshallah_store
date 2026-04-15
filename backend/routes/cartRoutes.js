// backend/routes/cartRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id:    decoded.id    || decoded.userId,
      role:  decoded.role  || "user",
      email: decoded.email || null,
    };
  } catch {
    req.user = null;
  }

  next();
}

router.get(   "/", optionalAuth, getCartController);
router.post(  "/add", optionalAuth, addToCartController);
router.delete("/remove/:productId", optionalAuth, removeFromCartController);

router.delete("/clear", authMiddleware, clearCartController);

export default router;