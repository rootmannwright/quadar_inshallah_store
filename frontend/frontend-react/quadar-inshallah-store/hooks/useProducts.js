import { useState, useEffect } from 'react';
import api from '../services/api';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/api/products', { params })
      .then(({ data }) => setProducts(data))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar produtos'))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { products, loading, error };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch((err) => setError(err.response?.data?.message || 'Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}