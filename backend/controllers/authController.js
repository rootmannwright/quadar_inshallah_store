import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import mongoose from "mongoose";
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
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Dados inválidos", details: error.details });
    }

    const exists = await User.findOne({ email: value.email });
    if (exists) {
      return res.status(409).json({ error: "Email já registrado" });
    }

    const hashed = await bcrypt.hash(value.password, 10);

    const user = await User.create({
      name: value.name,
      email: value.email,
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

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Dados inválidos", details: error.details });
    }

    const user = await User.findOne({ email: value.email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const match = await bcrypt.compare(value.password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    const schema = Joi.object({
      name: Joi.string().min(3).max(50),
      email: Joi.string().email(),
      password: Joi.string().min(6),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Dados inválidos", details: error.details });
    }
    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, value, {
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ message: "Usuário removido com sucesso" });
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}