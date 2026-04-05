import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

/* =========================
   HELPERS
========================= */
const sendError = (res, status, message, details = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

const sendSuccess = (res, status, message, data = {}) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

/* =========================
   INPUT VALIDATION
========================= */
const sanitizeEmail = (email) => email?.toLowerCase().trim();
const sanitizeString = (str) => str?.trim();

/* =========================
   REGISTER
========================= */
export async function register(req, res) {
  try {
    let { name, email, password } = req.body;

    name = sanitizeString(name);
    email = sanitizeEmail(email);
    password = sanitizeString(password);

    if (!name || !email || !password) {
      return sendError(res, 400, "Todos os campos são obrigatórios");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Senha deve ter no mínimo 6 caracteres");
    }

    // ✅ Proteção contra NoSQL Injection
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return sendError(res, 409, "Email já registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return sendSuccess(res, 201, "Usuário criado com sucesso", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return sendError(res, 500, "Erro interno no servidor");
  }
}

/* =========================
   LOGIN
========================= */
export async function login(req, res) {
  try {
    let { email, password } = req.body;

    email = sanitizeEmail(email);
    password = sanitizeString(password);

    if (!email || !password) {
      return sendError(res, 400, "Email e senha são obrigatórios");
    }

    // ✅ Proteção contra NoSQL Injection
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return sendError(res, 401, "Credenciais inválidas");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Credenciais inválidas");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido");
      return sendError(res, 500, "Erro de configuração do servidor");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, 200, "Login realizado com sucesso", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return sendError(res, 500, "Erro interno no servidor");
  }
}

/* =========================
   GET ALL USERS
========================= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "-password").lean();
    return sendSuccess(res, 200, "Usuários listados com sucesso", { users });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return sendError(res, 500, "Erro ao buscar usuários");
  }
}

/* =========================
   UPDATE USER
========================= */
export async function updateUserController(req, res) {
  try {
    const { id } = req.params;

    // ✅ Validação do ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const updateData = {};
    if (req.body.name) updateData.name = sanitizeString(req.body.name);
    if (req.body.email) updateData.email = sanitizeEmail(req.body.email);
    if (req.body.password) {
      updateData.password = await bcrypt.hash(sanitizeString(req.body.password), 10);
    }

    // ✅ Evita NoSQL Injection usando objetos simples
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password").lean();

    if (!user) return sendError(res, 404, "Usuário não encontrado");

    return sendSuccess(res, 200, "Usuário atualizado", { user });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return sendError(res, 500, "Erro ao atualizar usuário");
  }
}

/* =========================
   DELETE USER
========================= */
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
    console.error("DELETE ERROR:", err);
    return sendError(res, 500, "Erro ao deletar usuário");
  }
}