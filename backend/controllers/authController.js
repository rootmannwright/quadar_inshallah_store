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
   REGISTER
========================= */
export async function register(req, res) {
  try {
    let { name, email, password } = req.body;

    // normalização (🔥 evita bug silencioso)
    email = email?.toLowerCase().trim();
    name = name?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return sendError(res, 400, "Todos os campos são obrigatórios");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Senha deve ter no mínimo 6 caracteres");
    }

    const existingUser = await User.findOne({ email });

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

    // 🔥 normalização (isso resolve MUITO bug de "senha incorreta")
    email = email?.toLowerCase().trim();
    password = password?.trim();

    if (!email || !password) {
      return sendError(res, 400, "Email e senha são obrigatórios");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 401, "Credenciais inválidas"); // 🔥 não revela se email existe
    }

    // 🔥 comparação segura
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 401, "Credenciais inválidas");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido");
      return sendError(res, 500, "Erro de configuração do servidor");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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
    const users = await User.find().select("-password");

    return sendSuccess(res, 200, "Usuários listados com sucesso", {
      users,
    });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const updateData = { ...req.body };

    // 🔥 normalização
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password.trim(),
        10
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return sendError(res, 404, "Usuário não encontrado");
    }

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

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 404, "Usuário não encontrado");
    }

    return sendSuccess(res, 200, "Usuário deletado com sucesso");
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return sendError(res, 500, "Erro ao deletar usuário");
  }
}