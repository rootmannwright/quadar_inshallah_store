// hooks/useCookieConsent.js

import { useState, useEffect } from "react";
import {
  hasUserConsented,
  acceptAll,
  rejectAll,
  setCustomConsent,
  applyConsent,
} from "../services/consentService";

export const useCookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!hasUserConsented()) {
      // Primeira visita — exibe o modal
      setShowConsent(true);
    } else {
      // Visita recorrente — reaplica scripts já consentidos
      applyConsent();
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowConsent(false);
  };

  const handleCustomConsent = ({ analytics, marketing }) => {
    setCustomConsent({ analytics, marketing });
    setShowConsent(false);
  };

  return {
    showConsent,
    handleAcceptAll,
    handleRejectAll,
    handleCustomConsent,
  };
};