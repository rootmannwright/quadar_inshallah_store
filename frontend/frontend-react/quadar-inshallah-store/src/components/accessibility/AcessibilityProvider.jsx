import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function AccessibilityProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState("normal");

  useEffect(() => {
    const root = document.documentElement;

    // contraste
    root.classList.toggle("high-contrast", highContrast);

    // fonte
    root.style.fontSize =
      fontSize === "small"
        ? "14px"
        : fontSize === "large"
        ? "18px"
        : "16px";
  }, [highContrast, fontSize]);

  const value = {
    isOpen,
    setIsOpen,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}