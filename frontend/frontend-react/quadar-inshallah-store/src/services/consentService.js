// services/consentService.js

import { loadAnalytics, loadMetaPixel, disableTracking } from "../utils/consentLoaders";

const CONSENT_KEY = "cookie_consent";

export const CONSENT_STATUS = {
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CUSTOM: "custom",
};

const defaultConsent = {
  status: null,
  analytics: false,
  marketing: false,
  timestamp: null,
};

export const getConsent = () => {
  try {
    const data = localStorage.getItem(CONSENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Erro ao ler consentimento:", err);
    return null;
  }
};

export const setConsent = (consent) => {
  const payload = {
    ...defaultConsent,
    ...consent,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  return payload;
};

export const acceptAll = () => {
  const consent = setConsent({
    status: CONSENT_STATUS.ACCEPTED,
    analytics: true,
    marketing: true,
  });

  applyConsent();
  return consent;
};

export const rejectAll = () => {
  const consent = setConsent({
    status: CONSENT_STATUS.REJECTED,
    analytics: false,
    marketing: false,
  });

  disableTracking();
  return consent;
};

export const setCustomConsent = ({ analytics, marketing }) => {
  const consent = setConsent({
    status: CONSENT_STATUS.CUSTOM,
    analytics,
    marketing,
  });

  applyConsent();
  return consent;
};

export const hasUserConsented = () => {
  const consent = getConsent();
  return !!consent?.status;
};

export const applyConsent = () => {
  const consent = getConsent();

  if (!consent) return;

  const GA_ID = import.meta.env.VITE_GA_ID;
  const PIXEL_ID = import.meta.env.VITE_PIXEL_ID;

  if (consent.analytics) {
    loadAnalytics(GA_ID);
  }

  if (consent.marketing) {
    loadMetaPixel(PIXEL_ID);
  }
};

export const syncConsentWithBackend = async (api, user) => {
  if (!user) return;

  const consent = getConsent();
  if (!consent) return;

  try {
    await api.post("/user/consent", consent);
  } catch (err) {
    console.error("Erro ao sincronizar consentimento:", err);
  }
};