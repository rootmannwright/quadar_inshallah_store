import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-neutral-100 via-white to-neutral-200 overflow-hidden">

      {/* ===== TIRA ANIMADA TOPO ===== */}
      <div className="absolute top-0 left-0 w-full h-24 sm:h-28 md:h-32 overflow-hidden z-0">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex w-[200%] h-full"
        >
          <img
            src="/videos/gif-logo.gif"
            alt="loop"
            className="w-1/2 object-cover opacity-20"
          />
          <img
            src="/videos/gif-logo.gif"
            alt="loop"
            className="w-1/2 object-cover opacity-20"
          />
        </motion.div>
      </div>

      {/* ===== LADO ESQUERDO ===== */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-20">

        <img
          className="w-32 sm:w-40 md:w-44 mb-12 md:mb-20"
          src="/logos/logo-letreiro.png"
          alt="Logo"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black leading-tight">
            Efetue seu login
          </h1>

          <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-600 mb-4">
            Fazer login torna sua experiência mais rápida e exclusiva.
          </h2>

          <p className="max-w-md text-sm sm:text-base text-neutral-500">
            Entre para acessar lançamentos, drops exclusivos e acompanhar seus pedidos.
          </p>

          <Link to="/">
            <button className="mt-8 px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 transition-all shadow-lg">
              Voltar para Home
            </button>
          </Link>
        </motion.div>
      </div>

      {/* ===== LADO DIREITO ===== */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 pb-20 lg:pb-0">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10"
        >
          <div className="mb-6 text-center">
            <p className="text-neutral-500 text-xs sm:text-sm">
              Bem-vindo à{" "}
              <span className="font-semibold text-black">
                Quadar Inshallah Co. & Records
              </span>
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2">
              Sign in
            </h1>
          </div>

          {/* ===== SOCIAL LOGIN ===== */}
          <div className="space-y-3 mb-6">

            <button className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 transition font-medium">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                className="w-5"
                alt="Google"
              />
              Continuar com Google
            </button>

            <button className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-black text-white hover:bg-neutral-800 transition font-medium">
               Continuar com Apple
            </button>

            <button className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                className="w-5"
                alt="Facebook"
              />
              Continuar com Facebook
            </button>
          </div>

          {/* DIVISOR */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-neutral-300"></div>
            <span className="px-3 text-neutral-400 text-sm">ou</span>
            <div className="flex-1 h-px bg-neutral-300"></div>
          </div>

          {/* ===== FORM ===== */}
          <form className="space-y-5">

            <div>
              <label className="text-sm text-neutral-600 block mb-2">
                Email ou usuário
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-black focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-600 block mb-2">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-black focus:outline-none transition"
              />
              <div className="text-right mt-2">
                <a
                  href="#"
                  className="text-sm text-neutral-500 hover:text-black transition"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-xl hover:bg-neutral-800 transition shadow-lg"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}