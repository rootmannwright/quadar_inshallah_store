// utils/consentLoaders.js
// Consent management are in development and may change. This file is a placeholder for loading analytics and marketing scripts based on user consent.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const loadedScripts = new Set();

// Helper
const injectScript = ({ id, src, async = true }) => {
  if (loadedScripts.has(id) || document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = async;

  document.head.appendChild(script);
  loadedScripts.add(id);
};

// Google Analytics
export const loadAnalytics = (GA_ID) => {
  if (!GA_ID) {
    console.warn("GA_ID não fornecido");
    return;
  }

  // Main script
  injectScript({
    id: "ga-script",
    src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
  });

// Global configuration
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  gtag("js", new Date());
  gtag("config", GA_ID, {
    anonymize_ip: true, // 👍 ajuda na LGPD
  });

  console.log("📊 Analytics carregado");
};

// Meta pixel
export const loadMetaPixel = (PIXEL_ID) => {
  if (!PIXEL_ID) {
    console.warn("PIXEL_ID não fornecido");
    return;
  }

  if (window.fbq) return; // já carregado

  !(function(f,b,e,v,n,t,s){
    if(f.fbq) return;
    n = f.fbq = function(){
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if(!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");

  console.log("📢 Meta Pixel carregado");
};

/**
 * 💬 Exemplo: Chat (Intercom fake)
 */
export const loadChatWidget = () => {
  injectScript({
    id: "chat-widget",
    src: "https://example.com/chat.js",
  });

  console.log("💬 Chat carregado");
};

/**
 * 🧹 (opcional avançado) bloquear eventos após rejeição
 */
export const disableTracking = () => {
  // Google Analytics
  window["ga-disable"] = true;

  // Meta Pixel
  if (window.fbq) {
    window.fbq = () => {};
  }

  console.log("🚫 Tracking desativado");
};