import { useAccessibility } from "./AcessibilityProvider";
import "./acessibilitypanel.css"

export default function AccessibilityPanel() {
  const {
    isOpen,
    setIsOpen,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
  } = useAccessibility();

  return (
    <>
      {/* BOTÃO */}
      <button
        className="accessibility-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="https://img.icons8.com/?size=100&id=23608&format=png&color=000000"/>
      </button>

      {/* PAINEL */}
      {isOpen && (
        <div className="accessibility-panel">
          <h4>Acessibilidade</h4>

          <button onClick={() => setHighContrast(!highContrast)}>
            Contraste: {highContrast ? "ON" : "OFF"}
          </button>

          <div className="font-controls">
            <button onClick={() => setFontSize("small")}>A-</button>
            <button onClick={() => setFontSize("normal")}>A</button>
            <button onClick={() => setFontSize("large")}>A+</button>
          </div>
        </div>
      )}
    </>
  );
}