// src/api.js
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================
   INSTÂNCIA
========================= */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔥 obrigatório p/ cookies + CSRF
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =========================
   CSRF STATE
========================= */
let csrfToken = null;
let csrfPromise = null;

/* =========================
   GET CSRF TOKEN (FIXED)
========================= */
const fetchCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = api
      .get("/api/csrf-token") // 🔥 usa a própria instância
      .then((res) => {
        csrfToken = res.data.csrfToken;
        csrfPromise = null;
        return csrfToken;
      })
      .catch((err) => {
        csrfPromise = null;
        throw new Error("Falha ao obter CSRF token");
      });
  }

  return csrfPromise;
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
const SAFE_METHODS = ["get", "head", "options"];

api.interceptors.request.use(
  async (config) => {
    /* JWT */
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* CSRF */
    const method = (config.method || "get").toLowerCase();

    if (!SAFE_METHODS.includes(method)) {
      const csrf = await fetchCsrfToken();
      config.headers["x-csrf-token"] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    /* =========================
       JWT EXPIRED
    ========================= */
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      csrfToken = null;

      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    /* =========================
       CSRF EXPIRED (AUTO RETRY)
    ========================= */
    if (
      status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        csrfToken = null;

        const newToken = await fetchCsrfToken();

        originalRequest.headers["x-csrf-token"] = newToken;

        return api(originalRequest); // 🔥 retry automático
      } catch (err) {
        console.error("[CSRF] Falha ao renovar token");
      }
    }

    return Promise.reject(error);
  }
);

export default api;