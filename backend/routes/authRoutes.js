// routes/authRoutes.js
import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { permissionsMiddleware } from "../middleware/permissionsMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";
import { updateUserSchema } from "../schemas/updateUserSchema.js";
import { register, login, logout, getMe } from "../controllers/authController.js";
import {
  getAllUsers,
  updateUserController,
  deleteUserController,
} from "../controllers/userController.js";

const authRouter = express.Router();
authRouter.post("/register", validateRequest(createUserSchema), register);
authRouter.post("/login",    login);
authRouter.post("/logout",   logout); // Clean cookies on logout

authRouter.get("/me", authMiddleware, getMe);

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