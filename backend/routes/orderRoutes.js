// routes/orderRoutes.js
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

router.post("/", orderPostLimiter, authMiddleware, createOrder);

router.get("/:id", orderGetLimiter, authMiddleware, async (req, res, next) => {
  try {
    const schema = Joi.object({ id: Joi.string().required() });
    const { error, value } = schema.validate(req.params);

    if (error || !mongoose.Types.ObjectId.isValid(value.id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    req.params.id = value.id;
    return getOrderById(req, res, next);
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(500).json({ error: "Internal server error while fetching order" });
  }
});

router.get("/", orderGetLimiter, authMiddleware, getMyOrders);

export default router;