// seed/products.seed.js
import Product from "../models/Product.js";
import connectMongo from "../config/mongo";

const products = [
  {
    name: "Camiseta Careca Preta",
    price: 120,
    image: "/assets/camiseta_preta_quadar_inshallah_elipse_icon.jpg",
    description: "Camiseta careca preta",
  },
  {
    name: "Meia Branca Cano Alto",
    price: 100,
    image: "/assets/meia_branca_quadar_inshallah_elipse_icon.jpg",
    description: "Meia branca cano alto",
  }
];

async function seedProducts() {
  try {
    await connectMongo();

    await Product.deleteMany(); // limpa antes (opcional)
    await Product.insertMany(products);

    console.log("✅ Produtos inseridos com sucesso!");
    process.exit();
  } catch (error) {
    console.error("❌ Erro ao inserir produtos", error);
    process.exit(1);
  }
}

seedProducts();
