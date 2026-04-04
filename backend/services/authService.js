import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerService = async ({ name, email, password, role = "user" }) => {
  const exists = await User.findOne({ email });
  if (exists) throw { status: 400, message: "Email já cadastrado." };

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  return user;
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 400, message: "Credenciais inválidas." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 400, message: "Credenciais inválidas." };

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const getAllUsersService = async () => {
  return User.find().select("-password");
};

export const updateUserService = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
};

export const deleteUserService = async (id) => {
  await User.findByIdAndDelete(id);
  return { message: "Usuário deletado." };
};