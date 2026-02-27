import express from "express";
import mongoose from "mongoose";
import Joi from "joi";
import rateLimiter from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrderById,
  getMyOrders
} from "../controllers/orderController.js";

const router = express.Router();

// Rate limiter para POSTs e GETs
const orderPostLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests from this IP, please try again later."
});

const orderGetLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later."
});

// ================= CREATE ORDER =================
router.post("/", authMiddleware, orderPostLimiter, createOrder);

// ================= GET ORDER BY ID =================
router.get("/:id", authMiddleware, orderGetLimiter, async (req, res, next) => {
  try {
    const schema = Joi.object({ id: Joi.string().required() });
    const { error, value } = schema.validate(req.params);

    if (error || !mongoose.Types.ObjectId.isValid(value.id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    req.params.id = value.id;
    return getOrderById(req, res, next);
  } catch (err) {
    console.error("Error validating order ID:", err);
    return res.status(500).json({ error: "Internal server error while fetching order" });
  }
});

// ================= GET MY ORDERS =================
router.get("/", authMiddleware, orderGetLimiter, getMyOrders);

export default router;