import express from "express";
import mongoose from "mongoose";
import Joi from "joi";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrderById,
  getMyOrders
} from "../controllers/orderController.js";

const router = express.Router();

// Create order
router.post("/", authMiddleware, createOrder);


// Get specific order by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error || !mongoose.Types.ObjectId.isValid(value.id)) {
      return res.status(400).json({ error: "Invalid order ID"});
    }

    req.params.id = value.id;
    return getOrderById(req, res, next);
  } catch (err) {
    console.error("Error validating order ID:", err);
    return res.status(500).json({ error: "Internal server error while fetching order"});
  }
    });

// Get all orders for the authenticated user
router.get("/", authMiddleware, getMyOrders);

export default router;


