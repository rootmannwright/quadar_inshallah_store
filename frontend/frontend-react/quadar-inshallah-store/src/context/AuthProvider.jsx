// context/AuthProvider.jsx
import { createContext, useContext, useState } from "react";
import api from "../api.js"; // seu axios configurado com baseURL

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ─── Estado do usuário ───────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Login ───────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      // salva token e usuário no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      // mensagem da API ou fallback
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ────────────────────────────────────────
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // salva token e usuário no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ─────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ─── Retorno do contexto ────────────────────────────
  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acesso ao contexto
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};