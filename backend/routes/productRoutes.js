import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { doubleCsrfProtection } from "../middleware/csrf.js";

const router = express.Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const objectIdSchema = z.object({
  id: z
    .string({ required_error: "ID é obrigatório" })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "ID inválido",
    }),
});

const createProductSchema = z.object({
  name:        z.string({ required_error: "Nome é obrigatório" }).min(1).max(200),
  description: z.string({ required_error: "Descrição é obrigatória" }).min(1).max(2000),
  price:       z.number({ required_error: "Preço é obrigatório" }).positive("Preço deve ser positivo"),
  imageUrl:    z.string({ required_error: "URL da imagem é obrigatória" }).url("imageUrl deve ser uma URL válida"),
});

const updateProductSchema = z
  .object({
    name:        z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    price:       z.number().positive("Preço deve ser positivo").optional(),
    imageUrl:    z.string().url("imageUrl deve ser uma URL válida").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Ao menos um campo deve ser informado para atualização",
  });

const validateObjectId = (req, res, next) => {
  const result = objectIdSchema.safeParse(req.params);
  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Parâmetro inválido";
    return res.status(400).json({ error: message });
  }
  req.params.id = result.data.id;
  return next();
};

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Dados inválidos";
    return res.status(400).json({ error: message });
  }
  req.validatedBody = result.data;
  return next();
};

router.get("/", readLimiter, async (req, res) => {
  try {
    const produtos = await Product.find().lean();
    return res.json(produtos);
  } catch (err) {
    console.error("[GET /products]", err);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.get("/:id", readLimiter, validateObjectId, async (req, res) => {
  try {
    const produto = await Product.findById(req.params.id).lean();
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.json(produto);
  } catch (err) {
    console.error("[GET /products/:id]", err);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

router.post(
  "/",
  writeLimiter,
  authMiddleware,
  doubleCsrfProtection,
  validateBody(createProductSchema),
  async (req, res) => {
    try {
      const novoProduto = await Product.create(req.validatedBody);
      return res.status(201).json(novoProduto);
    } catch (err) {
      console.error("[POST /products]", err);
      return res.status(500).json({ error: "Erro ao criar produto" });
    }
  }
);

router.put(
  "/:id",
  writeLimiter,
  authMiddleware,
  doubleCsrfProtection,
  validateObjectId,
  validateBody(updateProductSchema),
  async (req, res) => {
    try {
      const produtoAtualizado = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.validatedBody },  // $set evita sobrescrever campos não enviados
        { new: true, runValidators: true }
      ).lean();

      if (!produtoAtualizado) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.json(produtoAtualizado);
    } catch (err) {
      console.error("[PUT /products/:id]", err);
      return res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }
);

router.delete(
  "/:id",
  writeLimiter,
  authMiddleware,
  doubleCsrfProtection,
  validateObjectId,
  async (req, res) => {
    try {
      const produto = await Product.findByIdAndDelete(req.params.id).lean();
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      return res.status(204).end();
    } catch (err) {
      console.error("[DELETE /products/:id]", err);
      return res.status(500).json({ error: "Erro ao deletar produto" });
    }
  }
);

export default router;