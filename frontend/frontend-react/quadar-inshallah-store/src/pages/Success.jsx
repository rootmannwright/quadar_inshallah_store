import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <a href="/" style={s.logo}>بوتيك</a>
        <nav style={s.nav}>
          {["Home", "Produtos", "Stories", "Login", "Carrinho"].map((item) => (
            <a key={item} href={item === "Home" ? "/" : `/${item.toLowerCase()}`} style={s.navLink}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <div style={s.breadcrumb}>
        <a href="/" style={s.breadcrumbLink}>HOME</a>
        <span style={s.breadcrumbSep}>›</span>
        <span style={s.breadcrumbActive}>CONFIRMAÇÃO</span>
      </div>

      <main
        style={{
          ...s.main,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <section style={s.left}>
          <div style={s.iconRow}>
            <div style={s.checkCircle}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <polyline points="4,11 9,16 18,6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h1 style={s.heading}>Pedido Confirmado</h1>
          <p style={s.subheading}>
            Obrigado pela sua compra! Você receberá um e-mail de confirmação em breve.
          </p>

          {sessionId && (
            <div style={s.infoBox}>
              <p style={s.infoLabel}>NÚMERO DO PEDIDO</p>
              <p style={s.infoValue}>{sessionId.slice(0, 28).toUpperCase()}</p>
            </div>
          )}

          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <p style={s.infoLabel}>STATUS</p>
              <p style={{ ...s.infoValue, color: "#2d7a2d" }}>Pagamento Aprovado</p>
            </div>
            <div style={s.infoItem}>
              <p style={s.infoLabel}>ENTREGA PREVISTA</p>
              <p style={s.infoValue}>5–8 dias úteis</p>
            </div>
          </div>

          <div style={s.tracker}>
            {["Pedido Confirmado", "Em Preparo", "Enviado", "Entregue"].map((step, i) => (
              <div key={i} style={s.trackerStep}>
                <div
                  style={{
                    ...s.trackerDot,
                    background: i === 0 ? "#1a1a1a" : "#d0d0d0",
                    border: i === 0 ? "2px solid #1a1a1a" : "2px solid #d0d0d0",
                  }}
                />
                {i < 3 && (
                  <div
                    style={{
                      ...s.trackerConnector,
                      background: i === 0 ? "#1a1a1a" : "#d0d0d0",
                    }}
                  />
                )}
                <p style={{ ...s.trackerLabel, color: i === 0 ? "#1a1a1a" : "#bbb" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside style={s.aside}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>RESUMO DO PEDIDO</h2>
            <div style={s.cardDivider} />
            <div style={s.summaryRow}><span style={s.summaryLabel}>Subtotal</span><span style={s.summaryValue}>—</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Impostos (10%)</span><span style={s.summaryValue}>—</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Frete</span><span style={s.summaryValue}>—</span></div>
            <div style={s.cardDivider} />
            <div style={s.summaryRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={{ ...s.totalLabel, color: "#2d7a2d", fontSize: 14 }}>Confirmado ✓</span>
            </div>
            <button
              style={s.btnPrimary}
              onClick={() => window.location.href = "/produtos"}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              CONTINUAR COMPRANDO
            </button>
            <a href="/meus-pedidos" style={s.btnSecondary}>← VER MEUS PEDIDOS</a>
          </div>
        </aside>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
      `}</style>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#fff", fontFamily: "'Jost', sans-serif", color: "#1a1a1a" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid #eee" },
  logo: { fontSize: 28, fontWeight: 500, color: "#1a1a1a" },
  nav: { display: "flex", gap: 40 },
  navLink: { fontSize: 14, color: "#1a1a1a", letterSpacing: "0.02em" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, padding: "16px 48px", fontSize: 11, letterSpacing: "0.08em", color: "#aaa" },
  breadcrumbLink: { color: "#aaa", cursor: "pointer" },
  breadcrumbSep: { fontSize: 10, color: "#ccc" },
  breadcrumbActive: { color: "#1a1a1a", borderBottom: "1px solid #1a1a1a", paddingBottom: 1 },
  main: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, maxWidth: 1100, margin: "48px auto", padding: "0 48px", alignItems: "start" },
  left: {},
  iconRow: { marginBottom: 24 },
  checkCircle: { width: 52, height: 52, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 12 },
  subheading: { fontSize: 14, color: "#666", lineHeight: 1.7, fontWeight: 300, marginBottom: 32, maxWidth: 420 },
  infoBox: { padding: "16px 20px", background: "#f9f9f9", marginBottom: 20 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px", marginBottom: 40 },
  infoItem: {},
  infoLabel: { fontSize: 10, letterSpacing: "0.14em", color: "#aaa", marginBottom: 6 },
  infoValue: { fontSize: 14, fontWeight: 500, color: "#1a1a1a" },
  tracker: { display: "flex", alignItems: "flex-start" },
  trackerStep: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  trackerDot: { width: 10, height: 10, borderRadius: "50%", marginBottom: 8, zIndex: 1, position: "relative" },
  trackerConnector: { position: "absolute", top: 4, left: "50%", width: "100%", height: 2, zIndex: 0 },
  trackerLabel: { fontSize: 9, letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.4 },
  aside: {},
  card: { border: "1px solid #e8e8e8", padding: "28px 24px" },
  cardTitle: { fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 20 },
  cardDivider: { height: 1, background: "#e8e8e8", margin: "16px 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: "#888", fontWeight: 300 },
  summaryValue: { fontSize: 13, color: "#888", fontWeight: 400 },
  totalLabel: { fontSize: 15, fontWeight: 600 },
  btnPrimary: { width: "100%", padding: "16px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 12, letterSpacing: "0.14em", cursor: "pointer", marginTop: 24, transition: "opacity 0.2s", display: "block", textAlign: "center" },
  btnSecondary: { display: "block", width: "100%", padding: "12px", background: "transparent", border: "none", fontSize: 11, letterSpacing: "0.1em", color: "#888", cursor: "pointer", marginTop: 8, textAlign: "center" },
};