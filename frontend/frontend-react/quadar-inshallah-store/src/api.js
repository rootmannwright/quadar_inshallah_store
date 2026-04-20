// src/api.js
// ─── Axios instance — Quadar Frontend ────────────────────────────────────────
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Instância base ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  timeout:         15_000,
  headers: {
    "Content-Type": "application/json",
    Accept:         "application/json",
  },
});

// ─── CSRF: busca e armazena o token ──────────────────────────────────────────

let csrfToken        = null;
let csrfFetchPromise = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
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
      // Não engole o erro — relança para o interceptor bloquear a requisição
      throw new Error(`[CSRF] Não foi possível buscar o token: ${err.message}`);
    });

  return csrfFetchPromise;
}

export { getCsrfToken };

// ─── Request interceptor ─────────────────────────────────────────────────────

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
      // ✅ Se o token não chegar, a requisição é BLOQUEADA
      // Isso fecha o caminho que o CodeQL detecta como CWE-352
      const csrf = await getCsrfToken();
      config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || "";

    // Token JWT expirado → limpa sessão silenciosamente
    // O PrivateRoute detecta user=null e redireciona quando necessário
    if (status === 401 && !url.includes("/api/auth/login")) {
      const storedToken = localStorage.getItem("token");

      if (storedToken && storedToken !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        csrfToken = null;
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    }

    // Token CSRF expirado → invalida cache para renovar na próxima requisição
    if (status === 403 && error.response?.data?.code === "EBADCSRFTOKEN") {
      csrfToken = null;
      console.warn("[CSRF] Token inválido, será renovado na próxima requisição.");
    }

    return Promise.reject(error);
  }
);

export default api;