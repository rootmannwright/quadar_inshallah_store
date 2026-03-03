import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider
} from "../firebase";
import "../styles/login.css";

export default function Login() {

  const [loading, setLoading] = useState(false);

  const socialLogin = async (provider) => {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row auto-dark overflow-hidden">

      {/* ===== PARALLAX BACKGROUND ===== */}
      <motion.div
        className="absolute inset-0 parallax-bg"
        animate={{ y: [0, -30] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />

      {/* ===== LEFT SIDE ===== */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 py-20">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Efetue seu login
        </motion.h1>

        <p className="text-lg opacity-70 max-w-md">
          Experiência exclusiva. Acesso rápido. Tudo centralizado.
        </p>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center px-6 pb-20 lg:pb-0">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/60 card-dark rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            Sign in
          </h2>

          {/* SOCIAL LOGIN */}
          <div className="space-y-3 mb-6">

            <button
              onClick={() => socialLogin(googleProvider)}
              className="w-full h-12 rounded-xl border bg-white hover:bg-neutral-100 transition"
            >
              Continuar com Google
            </button>

            <button
              onClick={() => socialLogin(appleProvider)}
              className="w-full h-12 rounded-xl bg-black text-white hover:bg-neutral-800 transition"
            >
              Continuar com Apple
            </button>

            <button
              onClick={() => socialLogin(facebookProvider)}
              className="w-full h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Continuar com Facebook
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-neutral-300"></div>
            <span className="px-3 text-sm opacity-50">ou</span>
            <div className="flex-1 h-px bg-neutral-300"></div>
          </div>

          {/* FORM */}
          <form className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              className="w-full h-12 px-4 rounded-xl border focus:ring-2 focus:ring-black outline-none"
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full h-12 px-4 rounded-xl border focus:ring-2 focus:ring-black outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-black text-white hover:bg-neutral-800 transition flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}