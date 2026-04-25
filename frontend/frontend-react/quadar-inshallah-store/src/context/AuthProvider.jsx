// src/context/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });

  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" && t !== "null" ? t : "";
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [loading,        setLoading]       = useState(false);
  const [error,          setError]         = useState(null);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setToken("");
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

// Helpers
  const persistSession = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", jwt);
  };

  const clearSession = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

// Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const { success, user: userData, token: jwt, message } = res.data;

      if (!success) {
        setError(message || "Credenciais inválidas");
        return { success: false, message };
      }

      if (jwt) persistSession(userData, jwt);
      else {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setError(null);
      return { success: true, user: userData, token: jwt };
    } catch (err) {
      const msg = err.response?.data?.message || "Erro de conexão";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

// Register
  const register = async (name, email, password, extras = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        "/api/auth/register",
        { name, email, password, ...extras },
        { withCredentials: true }
      );
      const { success, user: userData, token: jwt, message } = res.data;

      if (!success) { setError(message); return { success: false, message }; }

      if (jwt) persistSession(userData, jwt);
      else { setUser(userData); localStorage.setItem("user", JSON.stringify(userData)); }

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao cadastrar";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

// Logout
  const logout = async () => {
    clearSession();
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, isInitialized, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);