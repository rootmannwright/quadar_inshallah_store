// components/CookieModal.jsx

import { useState, useEffect } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";

const categories = [
  {
    id: "necessary",
    label: "Necessários",
    description: "Essenciais para o funcionamento do site. Não podem ser desativados.",
    locked: true,
  },
  {
    id: "analytics",
    label: "Analíticos",
    description: "Nos ajudam a entender como os visitantes interagem com o site (Google Analytics).",
    locked: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Utilizados para anúncios relevantes e campanhas personalizadas (Meta Pixel).",
    locked: false,
  },
];

function Toggle({ checked, onChange, locked }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={locked}
      onClick={() => !locked && onChange(!checked)}
      style={{
        flexShrink: 0,
        position: "relative",
        width: 40,
        height: 22,
        borderRadius: 11,
        border: "none",
        padding: 0,
        cursor: locked ? "not-allowed" : "pointer",
        background: checked ? "#111111" : "#CCCCCC",
        transition: "background 0.22s ease",
        opacity: locked ? 0.45 : 1,
        outline: "none",
      }}
    >
      <span
        style={{
          display: "block",
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#FFFFFF",
          transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

export default function CookieModal() {
  const { showConsent, handleAcceptAll, handleRejectAll, handleCustomConsent } =
    useCookieConsent();

  const [expanded, setExpanded] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    if (showConsent) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimIn(true));
      });
    } else {
      setAnimIn(false);
    }
  }, [showConsent]);

  const handleSaveCustom = () => {
    handleCustomConsent({
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    });
  };

  if (!showConsent) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

        .ck-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          z-index: 9998;
          transition: opacity 0.35s ease;
        }

        .ck-wrap {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          pointer-events: none;
        }

        .ck-box {
          pointer-events: all;
          width: 100%;
          max-width: 480px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          background: #F9F8F6;
          border: 1px solid #E2DDD8;
          border-radius: 10px;
          padding: 36px 36px 28px;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14), 0 4px 20px rgba(0,0,0,0.07);
          transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ck-box.hidden { opacity: 0; transform: translateY(16px); }
        .ck-box.shown  { opacity: 1; transform: translateY(0);    }

        .ck-eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #AAA;
          margin: 0 0 10px;
        }

        .ck-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: #111;
          line-height: 1.22;
          margin: 0 0 14px;
        }

        .ck-desc {
          font-size: 13px;
          font-weight: 300;
          color: #666;
          line-height: 1.65;
          margin: 0 0 20px;
        }

        .ck-desc a {
          color: #111;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ck-toggle-details {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 4px;
          transition: color 0.2s;
        }
        .ck-toggle-details:hover { color: #222; }

        .ck-chevron { display: inline-block; transition: transform 0.28s ease; }
        .ck-chevron.open { transform: rotate(180deg); }

        .ck-cats {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease, margin 0.3s ease;
        }
        .ck-cats.closed { max-height: 0;    opacity: 0; margin-top: 0;    }
        .ck-cats.open   { max-height: 400px; opacity: 1; margin-top: 16px; }

        .ck-cat {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 13px 0;
          border-bottom: 1px solid #ECEAE6;
        }
        .ck-cat:last-child { border-bottom: none; }

        .ck-cat-name {
          font-size: 13px;
          font-weight: 500;
          color: #111;
          margin-bottom: 2px;
        }

        .ck-cat-desc {
          font-size: 12px;
          font-weight: 300;
          color: #999;
          line-height: 1.5;
        }

        .ck-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 24px;
        }

        .ck-btn {
          padding: 13px 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .ck-btn:active { opacity: 0.85; }

        .ck-btn-dark {
          background: #111;
          color: #F9F8F6;
          border-color: #111;
        }
        .ck-btn-dark:hover { background: #2A2A2A; border-color: #2A2A2A; }

        .ck-btn-outline {
          background: transparent;
          color: #111;
          border-color: #C8C3BC;
        }
        .ck-btn-outline:hover { border-color: #111; }

        .ck-btn-ghost {
          grid-column: 1 / -1;
          background: transparent;
          color: #888;
          border: 1px solid #DDDAD5;
        }
        .ck-btn-ghost:hover { border-color: #999; color: #333; }
      `}</style>

      {/* Backdrop */}
      <div
        className="ck-backdrop"
        style={{ opacity: animIn ? 1 : 0 }}
        onClick={handleRejectAll}
      />

      {/* Wrapper */}
      <div className="ck-wrap">
        <div className={`ck-box ${animIn ? "shown" : "hidden"}`}>

          <p className="ck-eyebrow">Privacidade &amp; Cookies</p>

          <h2 className="ck-title">
            A sua privacidade<br />é importante para nós.
          </h2>

          <p className="ck-desc">
            Utilizamos cookies para melhorar a sua experiência de navegação,
            personalizar conteúdos e analisar o tráfego do site. Consulte a nossa{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>Política de Privacidade</a>.
          </p>

          {/* Preferences */}
          <button
            type="button"
            className="ck-toggle-details"
            onClick={() => setExpanded((v) => !v)}
          >
            <span className={`ck-chevron${expanded ? " open" : ""}`}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {expanded ? "Ocultar detalhes" : "Gerir preferências"}
          </button>

          {/* Categories */}
          <div className={`ck-cats ${expanded ? "open" : "closed"}`}>
            {categories.map((cat) => (
              <div className="ck-cat" key={cat.id}>
                <div>
                  <div className="ck-cat-name">{cat.label}</div>
                  <div className="ck-cat-desc">{cat.description}</div>
                </div>
                <Toggle
                  checked={cat.locked ? true : prefs[cat.id] ?? false}
                  onChange={(val) =>
                    setPrefs((p) => ({ ...p, [cat.id]: val }))
                  }
                  locked={cat.locked}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="ck-actions">
            <button className="ck-btn ck-btn-dark" onClick={handleAcceptAll}>
              Aceitar todos
            </button>

            <button className="ck-btn ck-btn-outline" onClick={handleRejectAll}>
              Recusar
            </button>

            {expanded ? (
              <button className="ck-btn ck-btn-ghost" onClick={handleSaveCustom}>
                Guardar seleção
              </button>
            ) : (
              <button
                className="ck-btn ck-btn-ghost"
                onClick={() => setExpanded(true)}
              >
                Personalizar cookies
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}