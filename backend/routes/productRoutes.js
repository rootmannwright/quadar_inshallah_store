// routes/productRoutes.js
import express from "express";
import Joi from "joi";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Rotas públicas (GET) ─────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const produtos = await Product.find();
    return res.json(produtos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idSchema = Joi.string().required();
    const { error, value } = idSchema.validate(req.params.id);

    if (error || !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const produto = await Product.findById(value);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.json(produto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// ─── Rotas protegidas (mutações) ──────────────────────────────────────────────
// authMiddleware em todas + CSRF virá do app.js

router.post("/", authMiddleware, async (req, res) => {
  try {
    const schema = Joi.object({
      name:        Joi.string().required(),
      description: Joi.string().required(),
      price:       Joi.number().required(),
      imageUrl:    Joi.string().uri().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const novoProduto = await Product.create(value);
    return res.status(201).json(novoProduto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const schema = Joi.object({
      name:        Joi.string(),
      description: Joi.string(),
      price:       Joi.number(),
      imageUrl:    Joi.string().uri(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const produtoAtualizado = await Product.findByIdAndUpdate(id, value, { new: true });
    if (!produtoAtualizado) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(produtoAtualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const produto = await Product.findByIdAndDelete(id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar produto" });
  }
});

export default router;