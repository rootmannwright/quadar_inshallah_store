import { createContext, useContext, useEffect, useState } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [contrast, setContrast] = useState(
    localStorage.getItem("contrast") === "true"
  );
  const [fontSize, setFontSize] = useState(
    Number(localStorage.getItem("fontSize")) || 100
  );

  useEffect(() => {
    document.body.classList.toggle("high-contrast", contrast);
    localStorage.setItem("contrast", contrast);
  }, [contrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const increaseFont = () =>
    setFontSize((prev) => Math.min(prev + 10, 150));

  const decreaseFont = () =>
    setFontSize((prev) => Math.max(prev - 10, 80));

  const resetAccessibility = () => {
    setContrast(false);
    setFontSize(100);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        contrast,
        setContrast,
        increaseFont,
        decreaseFont,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () =>
  useContext(AccessibilityContext);