// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const sendError = (res, status, message, details = null) =>
  res.status(status).json({ success: false, message, ...(details && { details }) });

const sendSuccess = (res, status, message, data = {}) =>
  res.status(status).json({ success: true, message, ...data });

const sanitizeString = (str) => (typeof str === "string" ? str.trim() : "");
const sanitizeEmail  = (email) => (typeof email === "string" ? email.toLowerCase().trim() : "");

const formatUser = (user) => ({
  id:      user._id,
  name:    user.name,
  email:   user.email,
  role:    user.role,
  phone:   user.phone   || "",
  address: user.address || "",
  zip:     user.zip     || "",
});

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 dias
  });
};

export async function register(req, res) {
  try {
    const name     = sanitizeString(req.body.name);
    const email    = sanitizeEmail(req.body.email);
    const password = sanitizeString(req.body.password);
    const phone    = sanitizeString(req.body.phone);
    const address  = sanitizeString(req.body.address);
    const zip      = sanitizeString(req.body.zip);

    if (!name || !email || !password)
      return sendError(res, 400, "Nome, email e senha são obrigatórios");
    if (password.length < 6)
      return sendError(res, 400, "Senha deve ter no mínimo 6 caracteres");

    const exists = await User.findOne({ email }).lean();
    if (exists) return sendError(res, 409, "Email já registrado");

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name, email, password: hashedPassword,
      role: "user", phone, address, zip,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    return sendSuccess(res, 201, "Usuário criado com sucesso", {
      user:  formatUser(user),
      token,
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return sendError(res, 500, "Erro interno no servidor");
  }
}

export async function login(req, res) {
  try {
    const email    = sanitizeEmail(req.body.email);
    const password = sanitizeString(req.body.password);

    if (!email || !password)
      return sendError(res, 400, "Email e senha são obrigatórios");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, 401, "Credenciais inválidas");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Credenciais inválidas");

    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN ERROR] JWT_SECRET não definido");
      return sendError(res, 500, "Erro de configuração do servidor");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    return sendSuccess(res, 200, "Login realizado com sucesso", {
      user:  formatUser(user),
      token,
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return sendError(res, 500, "Erro interno no servidor");
  }
}

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return sendSuccess(res, 200, "Logout realizado com sucesso");
}

export async function getMe(req, res) {
  try {
    if (!req.user) return sendError(res, 401, "Não autenticado");

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário encontrado", { user: formatUser(user) });
  } catch (err) {
    console.error("[GET ME ERROR]", err);
    return sendError(res, 500, "Erro ao buscar usuário");
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "-password").lean();
    return sendSuccess(res, 200, "Usuários listados", { users });
  } catch (err) {
    console.error("[GET USERS ERROR]", err);
    return sendError(res, 500, "Erro ao buscar usuários");
  }
}

export async function updateUserController(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return sendError(res, 400, "ID inválido");

    const updateData = {};
    if (req.body.name)  updateData.name  = sanitizeString(req.body.name);
    if (req.body.email) updateData.email = sanitizeEmail(req.body.email);
    if (req.body.password) {
      const newPassword = sanitizeString(req.body.password);
      if (newPassword.length < 6)
        return sendError(res, 400, "Senha deve ter no mínimo 6 caracteres");
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0)
      return sendError(res, 400, "Nenhum campo válido para atualizar");

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select("-password").lean();

    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário atualizado", { user });
  } catch (err) {
    console.error("[UPDATE ERROR]", err);
    return sendError(res, 500, "Erro ao atualizar usuário");
  }
}

export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return sendError(res, 400, "ID inválido");

    const user = await User.findByIdAndDelete(id).lean();
    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário deletado com sucesso");
  } catch (err) {
    console.error("[DELETE ERROR]", err);
    return sendError(res, 500, "Erro ao deletar usuário");
  }
}