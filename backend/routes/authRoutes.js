import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { permissionsMiddleware } from "../middleware/permissionsMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";
import { updateUserSchema } from "../schemas/updateUserSchema.js";
import {
  register,
  login,
  getAllUsers,
  updateUserController,
  deleteUserController,
} from "../controllers/authController.js";

const authRouter = express.Router();

// públicas
authRouter.post("/register", validateRequest(createUserSchema), register);
authRouter.post("/login", login);

// protegidas
authRouter.get(
  "/users",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  getAllUsers
);

authRouter.post(
  "/users",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  validateRequest(createUserSchema),
  register
);

authRouter.put(
  "/users/:id",
  authMiddleware,
  permissionsMiddleware(["admin", "user"]),
  validateRequest(updateUserSchema),
  updateUserController
);

authRouter.delete(
  "/users/:id",
  authMiddleware,
  permissionsMiddleware(["admin"]),
  deleteUserController
);

export default authRouter;