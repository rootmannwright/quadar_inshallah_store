import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrderById,
  getMyOrders
} from "../controllers/orderController.js";

const router = express.Router();

// Criar pedido
router.post("/", authMiddleware, createOrder);

// Buscar pedido específico
router.get("/:id", authMiddleware, getOrderById);

// Listar pedidos do usuário
router.get("/", authMiddleware, getMyOrders);

export default router;


