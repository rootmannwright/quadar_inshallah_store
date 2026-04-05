// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // seu api.js do frontend

// ==========================
// CONTEXTO
// ==========================
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// ==========================
// HOOK PRINCIPAL
// ==========================
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ==========================
  // CHECAR SE HÁ TOKEN
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ==========================
  // LOGIN
  // ==========================
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Erro no login" };
    }
  };

  // ==========================
  // REGISTER
  // ==========================
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Erro no registro" };
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // ==========================
  // RETORNO
  // ==========================
  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}