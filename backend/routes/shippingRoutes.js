import express from "express";
import { calcShipping } from "../controllers/shippingController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/calculate-shipping', auth, calcShipping);

export default router;