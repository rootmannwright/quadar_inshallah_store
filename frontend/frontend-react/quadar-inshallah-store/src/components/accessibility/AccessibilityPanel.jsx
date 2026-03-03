import { useState, useRef, useEffect } from "react";
import { useAccessibility } from "./AcessibilityProvider";

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    contrast,
    setContrast,
    increaseFont,
    decreaseFont,
    resetAccessibility,
  } = useAccessibility();

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const speakPage = () => {
    const text = document.body.innerText;
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu de acessibilidade"
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-xl flex items-center justify-center hover:scale-105 transition"
      >
        ♿
      </button>

      {/* Painel */}
      {open && (
        <div className="mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 space-y-3">
          <h2 className="font-semibold text-lg">Acessibilidade</h2>

          <button
            onClick={() => setContrast(!contrast)}
            className="w-full border p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {contrast ? "Desativar Alto Contraste" : "Ativar Alto Contraste"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={increaseFont}
              className="flex-1 border p-2 rounded"
            >
              A+
            </button>
            <button
              onClick={decreaseFont}
              className="flex-1 border p-2 rounded"
            >
              A-
            </button>
          </div>

          <button
            onClick={speakPage}
            className="w-full border p-2 rounded"
          >
            🔊 Ler Página
          </button>

          <button onClick={() => {
            window.speechSynthesis.cancel();
          }} className="w-full bg-red-500 text-white p-2 rounded">
            Reset
          </button>
          
        </div>
      )}
    </div>
  );
}