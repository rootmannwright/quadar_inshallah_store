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
      setShowConsent(true);
    } else {
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