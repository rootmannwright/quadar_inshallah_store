import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white p-4 rounded shadow">
            <img src={product.imagem} alt={product.nome} className="w-full h-48 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{product.nome}</h2>
            <p className="text-gray-500">{product.descricao}</p>
            <p className="text-lg font-bold">R${product.preco.toFixed(2)}</p>
            <Link
              to={`/products/${product._id}`}
              className="mt-2 inline-block bg-black text-white px-4 py-2 rounded"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}