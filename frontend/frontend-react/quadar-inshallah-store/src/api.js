import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // obrigatório — sua API usa credentials: true no CORS
});

// Injeta o token JWT em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido → limpa sessão e redireciona
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Rate limit atingido — sua API retorna mensagem customizada em 429
    if (error.response?.status === 429) {
      console.warn('Rate limit atingido:', error.response.data?.error);
    }

    return Promise.reject(error);
  }
);

export default api;