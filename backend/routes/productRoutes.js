import express from "express";
import Product from "../models/Product.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= LISTAR TODOS =================
router.get("/", async (req, res) => {
  try {
    const produtos = await Product.find();
    return res.json(produtos); // return adicionado
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// ================= BUSCAR POR ID =================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const produto = await Product.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.json(produto);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "ID inválido" });
  }
});

// ================= CRIAR =================
router.post("/", adminOnly, async (req, res) => {
  try {
    const novoProduto = await Product.create(req.body);
    return res.status(201).json(novoProduto);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Erro ao criar produto" });
  }
});

// ================= ATUALIZAR =================
router.put("/:id", async (req, res) => {
  try {
    const produtoAtualizado = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!produtoAtualizado) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(produtoAtualizado);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Erro ao atualizar produto" });
  }
});

// ================= DELETAR =================
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const produto = await Product.findByIdAndDelete(req.params.id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.status(204).end(); // return adicionado
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Erro ao deletar produto" });
  }
});

export default router;