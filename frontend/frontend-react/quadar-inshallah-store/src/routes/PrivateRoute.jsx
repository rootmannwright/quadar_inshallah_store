// src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute({ children }) {
  const { user, isInitialized } = useAuth();
  const location = useLocation();

  // ✅ Aguarda o AuthProvider terminar de ler o localStorage
  // Sem isso, o PrivateRoute vê user=null no primeiro frame e redireciona
  if (!isInitialized) {
    return null; // ou um spinner mínimo — não redireciona ainda
  }

  if (!user) {
    // Passa a rota atual como state para voltar depois do login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}