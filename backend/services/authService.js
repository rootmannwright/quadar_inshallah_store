// services/authService.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendEmail } from "./email/sendEmail.js";
import { verifyEmailTemplate } from "./email/templates/verifyEmailTemplate.js";

import {
  createToken,
  validateToken,
  markTokenAsUsed,
} from "../modules/token/tokenUtils.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ======================
// REGISTER
// ======================
export const registerService = async ({
  name,
  email,
  password,
  role = "user",
}) => {
  const exists = await User.findOne({ email });
  if (exists) throw { status: 400, message: "Email já cadastrado." };

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    isVerified: false,
  });

  // cria token
  const token = await createToken({
    userId: user._id,
    type: "VERIFY_EMAIL",
  });

  // envia email
  await sendEmail({
    to: user.email,
    subject: "Verifique seu email",
    html: verifyEmailTemplate(token),
  });

  return {
    message: "Conta criada. Verifique seu email.",
  };
};

// ======================
// VERIFY EMAIL
// ======================
export const verifyEmailService = async (token) => {
  const storedToken = await validateToken({
    token,
    type: "VERIFY_EMAIL",
  });

  // marca token como usado
  await markTokenAsUsed(storedToken._id);

  // verifica usuário
  await User.findByIdAndUpdate(storedToken.userId, {
    isVerified: true,
  });

  return { message: "Email verificado com sucesso." };
};

// ======================
// LOGIN
// ======================
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 400, message: "Credenciais inválidas." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 400, message: "Credenciais inválidas." };

  if (!user.isVerified) {
    throw {
      status: 403,
      message: "Verifique seu email antes de acessar.",
    };
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

// ======================
// GET USERS
// ======================
export const getAllUsersService = async () => {
  return User.find().select("-password");
};

// ======================
// UPDATE USER
// ======================
export const updateUserService = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password");
};

// ======================
// DELETE USER
// ======================
export const deleteUserService = async (id) => {
  await User.findByIdAndDelete(id);
  return { message: "Usuário deletado." };
};