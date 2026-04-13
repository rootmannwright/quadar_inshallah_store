// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String },
    category: { type: String },
    stock: { type: Number, default: 0 },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;