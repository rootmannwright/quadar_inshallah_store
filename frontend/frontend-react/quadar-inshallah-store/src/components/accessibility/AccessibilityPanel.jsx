import { useState, useRef, useEffect } from "react";
import { useAccessibility } from "./AcessibilityProvider";

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const {
    contrast,
    setContrast,
    increaseFont,
    decreaseFont,
    resetAccessibility,
  } = useAccessibility();

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const speakPage = () => {
    const text = document.body.innerText;
    const speech = new SpeechSynthesisUtterance(text);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    resetAccessibility();
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir menu de acessibilidade"
        className="
          bg-blue-600 text-white 
          w-16 h-16 
          rounded-full 
          shadow-xl 
          text-2xl 
          flex items-center justify-center 
          transition-all duration-200
          hover:scale-110 hover:shadow-2xl
          focus:outline-none focus:ring-4 focus:ring-blue-300
        "
      >
        <img src="https://img.icons8.com/?size=50&id=4355&format=png&color=FFFFFF" alt="Wheelchair" />
      </button>

      {/* Painel */}
      {open && (
        <div
          className="
            absolute bottom-20 right-0 
            w-72 
            bg-white dark:bg-gray-800 
            rounded-2xl 
            shadow-2xl 
            p-5 
            space-y-4
          "
        >
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
            Acessibilidade
          </h2>

          <button
            onClick={() => setContrast(!contrast)}
            className="w-full border p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {contrast
              ? "Desativar Alto Contraste"
              : "Ativar Alto Contraste"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={increaseFont}
              className="flex-1 border p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              A+
            </button>
            <button
              onClick={decreaseFont}
              className="flex-1 border p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              A-
            </button>
          </div>

          <button
            onClick={speakPage}
            className="w-full border p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            🔊 Ler Página
          </button>

          <button
            onClick={handleReset}
            className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
          >
            Resetar
          </button>
        </div>
      )}
    </div>
  );
}