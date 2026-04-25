// routes/shippingRoutes.js
import express from "express";
import { calcShipping } from "../controllers/shippingController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /shipping/calculate - Calculate shipping cost - Protected route
router.post("/calculate-shipping", auth, calcShipping);

export default router;