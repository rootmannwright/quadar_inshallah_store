// controllers/userController.js
import bcrypt   from "bcryptjs";
import mongoose from "mongoose";
import User     from "../models/User.js";

const sendError = (res, status, message, details = null) =>
  res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });

const sendSuccess = (res, status, message, data = {}) =>
  res.status(status).json({
    success: true,
    message,
    ...data,
  });

const sanitizeString = (str) =>
  typeof str === "string" ? str.trim() : "";

const sanitizeEmail = (email) =>
  typeof email === "string" ? email.toLowerCase().trim() : "";

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "-password").lean();

    return sendSuccess(res, 200, "Usuários listados com sucesso", { users });
  } catch (err) {
    console.error("[GET USERS ERROR]", err);
    return sendError(res, 500, "Erro ao buscar usuários");
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const user = await User.findById(id, "-password").lean();

    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário encontrado", { user });
  } catch (err) {
    console.error("[GET USER ERROR]", err);
    return sendError(res, 500, "Erro ao buscar usuário");
  }
}

export async function updateUserController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const updateData = {};

    if (req.body.name && typeof req.body.name === "string") {
      updateData.name = sanitizeString(req.body.name);
    }

    if (req.body.email && typeof req.body.email === "string") {
      updateData.email = sanitizeEmail(req.body.email);
    }

    if (req.body.password && typeof req.body.password === "string") {
      const newPassword = sanitizeString(req.body.password);
      if (newPassword.length < 6) {
        return sendError(res, 400, "Senha deve ter no mínimo 6 caracteres");
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, "Nenhum campo válido para atualizar");
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário atualizado com sucesso", { user });
  } catch (err) {
    console.error("[UPDATE ERROR]", err);
    return sendError(res, 500, "Erro ao atualizar usuário");
  }
}

export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const user = await User.findByIdAndDelete(id).lean();

    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário deletado com sucesso");
  } catch (err) {
    console.error("[DELETE ERROR]", err);
    return sendError(res, 500, "Erro ao deletar usuário");
  }
}