import express from "express";

// Middlewares
import { validateRequest } from "../middleware/validateRequest.js";
import authMiddleware  from "../middleware/authMiddleware.js";
import { permissionsMiddleware } from "../middleware/permissionsMiddleware.js";

// Schemas
import { createUserSchema } from "../schemas/userSchema.js";
import { updateUserSchema } from "../schemas/updateUserSchema.js";

// Controllers
import {
  register,
  login,
  getAllUsers,
  updateUserController,
  deleteUserController
} from "../controllers/authController.js";

const router = express.Router();

/* =========================
   ROTAS PÚBLICAS
========================= */
router.post("/register", validateRequest(createUserSchema), register);
router.post("/login", login);

/* =========================
   ROTAS PROTEGIDAS
========================= */
// Listar todos usuários (admin)
router.get("/users", authMiddleware, permissionsMiddleware(["admin"]), getAllUsers);

// Criar usuário (admin)
router.post("/users", authMiddleware, permissionsMiddleware(["admin"]), validateRequest(createUserSchema), register);

// Atualizar usuário (admin ou próprio usuário)
router.put(
  "/users/:id",
  authMiddleware,
  permissionsMiddleware(["admin", "user"]),
  validateRequest(updateUserSchema),
  updateUserController
);

// Deletar usuário (apenas admin)
router.delete("/users/:id", authMiddleware, permissionsMiddleware(["admin"]), deleteUserController);

export default router;
