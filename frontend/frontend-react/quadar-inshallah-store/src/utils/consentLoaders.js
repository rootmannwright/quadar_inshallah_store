// utils/consentLoaders.js

/**
 * 🔒 Evita carregar o mesmo script mais de uma vez
 */
const loadedScripts = new Set();

/**
 * 🧠 Helper genérico para injetar script
 */
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

/**
 * 📊 Google Analytics (GA4)
 */
export const loadAnalytics = (GA_ID) => {
  if (!GA_ID) {
    console.warn("GA_ID não fornecido");
    return;
  }

  // Script principal
  injectScript({
    id: "ga-script",
    src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
  });

  // Configuração global
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  gtag("js", new Date());
  gtag("config", GA_ID, {
    anonymize_ip: true, // 👍 ajuda na LGPD
  });

  console.log("📊 Analytics carregado");
};

/**
 * 📢 Meta Pixel (Facebook Ads)
 */
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