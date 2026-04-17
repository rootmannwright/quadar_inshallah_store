// src/api.js
// ─── Axios instance — Quadar Frontend ────────────────────────────────────────
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Instância base ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  timeout:         15_000, // 15s
  headers: {
    "Content-Type": "application/json",
    Accept:         "application/json",
  },
});

// ─── CSRF: busca e armazena o token ──────────────────────────────────────────

let csrfToken      = null;
let csrfFetchPromise = null;   // evita múltiplas requisições simultâneas

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  // Se já existe uma requisição em voo, aguarda ela
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = axios
    .get(`${BASE_URL}/api/csrf-token`, { withCredentials: true })
    .then((res) => {
      csrfToken        = res.data.csrfToken;
      csrfFetchPromise = null;
      return csrfToken;
    })
    .catch((err) => {
      csrfFetchPromise = null;
      console.warn("[CSRF] Não foi possível buscar o token:", err.message);
      return null;
    });

  return csrfFetchPromise;
}

// Expõe para uso manual (ex: Cart.jsx, Products.jsx)
export { getCsrfToken };

// ─── Request interceptor ─────────────────────────────────────────────────────
// Injeta automaticamente:
//   • Authorization: Bearer <token>  (se existir no localStorage)
//   • X-CSRF-Token                   (em métodos que alteram estado)

const SAFE_METHODS = ["get", "head", "options"];

api.interceptors.request.use(
  async (config) => {
    // JWT
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF apenas em mutações (POST, PUT, PATCH, DELETE)
    const method = (config.method || "get").toLowerCase();
    if (!SAFE_METHODS.includes(method)) {
      const csrf = await getCsrfToken();
      if (csrf) config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
// ⚠️  NÃO faz window.location.href = "/login" em 401
//     Isso causava o loop de redirecionamento.
//     O AuthProvider e o PrivateRoute gerenciam o estado de autenticação.

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status  = error.response?.status;
    const url     = error.config?.url || "";

    // Token expirado ou inválido → limpa localStorage silenciosamente
    // O PrivateRoute vai detectar user=null e redirecionar quando necessário
    if (status === 401) {
      const isLoginRoute = url.includes("/api/auth/login");

      // Não limpa sessão se o próprio login falhou com 401
      // (seria "credenciais erradas", não "token expirado")
      if (!isLoginRoute) {
        const storedToken = localStorage.getItem("token");

        // Só limpa se havia um token (= sessão expirada, não tentativa de login)
        if (storedToken && storedToken !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Invalida o CSRF cacheado — próximo request buscará um novo
          csrfToken = null;

          // ✅ Dispara evento customizado — AuthProvider pode ouvir se quiser
          window.dispatchEvent(new CustomEvent("auth:expired"));
        }
      }
    }

    // Token CSRF expirado → invalida cache e deixa o retry para o usuário
    if (status === 403 && error.response?.data?.code === "EBADCSRFTOKEN") {
      csrfToken = null; // próxima requisição vai buscar novo token
      console.warn("[CSRF] Token inválido, será renovado na próxima requisição.");
    }

    return Promise.reject(error);
  }
);

export default api;