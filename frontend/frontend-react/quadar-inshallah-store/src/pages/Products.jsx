import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";
import "../styles/products.css";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function StockLabel({ stock }) {
  if (stock === undefined || stock === null) return null;
  if (stock === 0) return <span className="product-stock out">Esgotado</span>;
  if (stock <= 5) return <span className="product-stock low">Últimas {stock} unidades</span>;
  return <span className="product-stock ok">Em estoque: {stock}</span>;
}

function ProductCard({ product, onAddToCart, adding }) {
  const outOfStock = product.stock === 0;

  return (
    <motion.div variants={itemVariants} className="product-item">
      <div className={`product-img-wrap ${outOfStock ? "is-sold-out" : ""}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-img" />
        ) : (
          <div className="product-img-placeholder">Sem imagem</div>
        )}
        {outOfStock && <div className="sold-out-overlay">Esgotado</div>}
      </div>

      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <p className="product-price">
          R${Number(product.price).toFixed(2).replace(".", ",")}
        </p>
        <StockLabel stock={product.stock} />

        {!outOfStock && (
          <button
            className="product-add-btn"
            onClick={() => onAddToCart(product)}
            disabled={adding === product._id}
          >
            {adding === product._id ? "Adicionando..." : "+ Adicionar ao carrinho"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="product-item">
      <div className="product-img-wrap skeleton-img" />
      <div className="product-info">
        <div className="skeleton-line w-3/4" />
        <div className="skeleton-line w-1/3" />
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null);

  // 🔥 GET PRODUCTS (agora usando api)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get("/api/products");
        setProducts(data);
      } catch (err) {
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function handleAddToCart(product) {
  setAdding(product._id);

  try {
    const res = await api.post(
      "/api/cart/add",
      {
        productId: product._id,
        qty: 1,
      },
      {
        withCredentials: true,
      }
    );

    console.log("Adicionado:", res.data);

  } catch (err) {
    console.error("Erro completo:", err);

    alert("Erro ao adicionar ao carrinho");
  } finally {
    setAdding(null);
  }
}

  return (
    <div className="products-page">
      <motion.div
        className="products-heading"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Produtos</h1>
        <p>Quadar Inshallah Co. & Records</p>
      </motion.div>

      {error && <p className="products-error">{error}</p>}

      {loading && (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <motion.div
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              adding={adding}
            />
          ))}
        </motion.div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="products-empty">Nenhum produto encontrado.</p>
      )}
    </div>
  );
}