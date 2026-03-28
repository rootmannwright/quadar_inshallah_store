import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Email ou senha incorretos");
    }
  };

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      
      {/* Card central */}
      <div className="relative max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Banner superior */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24 flex items-center justify-center">
          <h1 className="text-3xl font-extrabold text-white">Bem-vindo</h1>
        </div>

        {/* Conteúdo do card */}
        <div className="p-8 space-y-6">
          
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                placeholder="exemplo@site.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200"
            >
              Entrar
            </button>
          </form>

          {/* Links de ajuda */}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <a href="#" className="hover:underline">Esqueceu a senha?</a>
            <a href="/register" className="hover:underline">Criar conta</a>
          </div>
        </div>

      </div>
    </div>
  );
}