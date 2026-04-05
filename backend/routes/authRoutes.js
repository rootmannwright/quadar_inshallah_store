import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { permissionsMiddleware } from "../middleware/permissionsMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";
import { updateUserSchema } from "../schemas/updateUserSchema.js";
import { register, login } from "../controllers/authController.js";
import {
  getAllUsers,
  updateUserController,
  deleteUserController,
} from "../controllers/userController.js";

const authRouter = express.Router();

// ─── PÚBLICAS ──────────────────────────────────────────────
// Registro de novos usuários (frontend)  
authRouter.post("/register", validateRequest(createUserSchema), register);

// Login de usuários  
authRouter.post("/login", login);

// ─── PROTEGIDAS ───────────────────────────────────────────
// Listar todos os usuários (apenas admin)  
authRouter.get(
  "/users",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  getAllUsers
);

// Criar usuário via admin (backend/admin panel)  
authRouter.post(
  "/users",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  validateRequest(createUserSchema),
  register
);

// Atualizar usuário (admin ou o próprio user)  
authRouter.put(
  "/users/:id",
  authMiddleware,
  permissionsMiddleware(["admin", "user"]),
  validateRequest(updateUserSchema),
  updateUserController
);

// Deletar usuário (apenas admin)  
authRouter.delete(
  "/users/:id",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  deleteUserController
);

export default authRouter;