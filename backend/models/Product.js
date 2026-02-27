import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    descricao: { type: String, required: true },
    imagem: { type: String },
    category: { type: String },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
