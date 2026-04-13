// src/context/AuthProvider.js
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api"; // axios instance

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [error, setError] = useState(null);

  // Função de login
  const login = async (email, password) => {
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true } // aceita cookie CSRF
      );

      if (res.data.success) {
        const { user, token } = res.data;

        // Salva no state e no localStorage
        setUser(user);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        setError(null);
        return { success: true, user };
      } else {
        setError(res.data.message || "Erro no login");
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      setError("Erro de conexão com o servidor");
      return { success: false, message: "Erro de conexão" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);