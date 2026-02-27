import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================
   GET ALL USERS (admin)
========================= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}

/* =========================
   REGISTER
========================= */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no registro" });
  }
}

/* =========================
   LOGIN
========================= */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
    algorithm: "HS256"
  }
);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no login" });
  }
}

/* =========================
   UPDATE USER
========================= */
export async function updateUserController(req, res) {
  try {
    const { id } = req.params;
    const loggedUser = req.user;

    // 1️⃣ Only admins can update any user
    // Common users can only update themselves
    if (loggedUser.role !== "admin" && loggedUser._id.toString() !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // 2️⃣ Allow fields that can be updated
    const allowedUpdates = ["name", "email", "password"];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // 3️⃣ Never allows role updates through this endpoint
    if (req.body.role) {
      return res.status(403).json({ error: "Não é permitido alterar a role" });
    }

    // 4️⃣ If refresh tokens and password is being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({
      message: "Usuário atualizado com sucesso",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
}

/* =========================
   DELETE USER
========================= */
export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}