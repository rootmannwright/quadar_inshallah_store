import Product from "../models/Product.js";

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
    res.json(products);
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}
