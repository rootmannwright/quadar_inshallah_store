// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider"; // ajuste aqui para o contexto certo

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Enquanto checa o login, mostra um loading
  if (loading) return <p>Carregando...</p>;

  // Se não estiver logado, redireciona para /login
  if (!user) return <Navigate to="/login" replace />;

  // Usuário logado — renderiza o componente protegido
  return children;
}