import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ERROR_REASONS = {
  card_declined: "Seu cartão foi recusado pelo banco emissor.",
  insufficient_funds: "Saldo insuficiente para concluir a transação.",
  expired_card: "O cartão informado está expirado.",
  incorrect_cvc: "O código de segurança (CVV) está incorreto.",
  processing_error: "Erro temporário no processamento. Tente novamente.",
  default: "Não foi possível processar seu pagamento.",
};

export default function PaymentFailed() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const errorCode = params.get("error") || "default";
  const errorMsg = ERROR_REASONS[errorCode] || ERROR_REASONS.default;

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
        <a href="/carrinho" style={s.breadcrumbLink}>CART</a>
        <span style={s.breadcrumbSep}>›</span>
        <span style={s.breadcrumbActive}>PAGAMENTO RECUSADO</span>
      </div>

      <main
        style={{
          ...s.main,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Left */}
        <section style={s.left}>
          <div style={s.iconRow}>
            <div style={s.xCircle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="5" y1="5" x2="15" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <line x1="15" y1="5" x2="5" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h1 style={s.heading}>Pagamento não realizado</h1>
          <p style={s.subheading}>
            {errorMsg} Seus itens ainda estão no carrinho — nenhum valor foi cobrado.
          </p>

          {/* Error detail */}
          <div style={s.errorBox}>
            <div style={s.errorHeader}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#c0392b" strokeWidth="1.2" />
                <line x1="7" y1="4" x2="7" y2="8" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="10.5" r="0.8" fill="#c0392b" />
              </svg>
              <span style={s.errorTitle}>ERRO DE PAGAMENTO</span>
            </div>
            <p style={s.errorText}>{errorMsg}</p>
            {errorCode !== "default" && (
              <p style={s.errorCode}>Código: {errorCode.replace(/_/g, " ").toUpperCase()}</p>
            )}
          </div>

          {/* Tips */}
          <div style={s.tipsSection}>
            <p style={s.tipsTitle}>O QUE VOCÊ PODE FAZER</p>
            <ul style={s.tipsList}>
              {[
                "Verifique os dados do cartão (número, validade e CVV)",
                "Certifique-se que o cartão tem limite disponível",
                "Tente um cartão diferente ou outro método de pagamento",
                "Entre em contato com o banco emissor do seu cartão",
              ].map((tip, i) => (
                <li key={i} style={s.tipItem}>
                  <span style={s.tipDot}>—</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={s.support}>
            <p style={s.supportLabel}>SUPORTE</p>
            <p style={s.supportText}>
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@boutique.com" style={s.supportLink}>suporte@boutique.com</a>
            </p>
          </div>
        </section>

        {/* Right */}
        <aside style={s.aside}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>RESUMO DO PEDIDO</h2>
            <div style={s.cardDivider} />

            <div style={s.retrySection}>
              <p style={s.retryLabel}>TENTE OUTRO MÉTODO</p>
              <div style={s.methodBtns}>
                {[
                  { label: "NOVO CARTÃO", icon: "💳" },
                  { label: "PIX", icon: "◎" },
                  { label: "BOLETO", icon: "📄" },
                ].map((m, i) => (
                  <button
                    key={i}
                    style={s.methodBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a1a1a"; }}
                  >
                    <span>{m.icon}</span>
                    <span style={{ fontSize: 9, letterSpacing: "0.1em" }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={s.cardDivider} />

            <div style={s.summaryRow}><span style={s.summaryLabel}>Subtotal</span><span style={s.summaryValue}>—</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Impostos (10%)</span><span style={s.summaryValue}>—</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Frete</span><span style={s.summaryValue}>R$25,00</span></div>
            <div style={s.cardDivider} />
            <div style={s.summaryRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={s.totalLabel}>—</span>
            </div>

            <button
              style={s.btnPrimary}
              onClick={() => window.location.href = "/carrinho"}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              TENTAR NOVAMENTE
            </button>

            <a href="/carrinho" style={s.btnSecondary}>← VOLTAR AO CARRINHO</a>
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
  xCircle: { width: 52, height: 52, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 12 },
  subheading: { fontSize: 14, color: "#666", lineHeight: 1.7, fontWeight: 300, marginBottom: 28, maxWidth: 440 },
  errorBox: { border: "1px solid #f0d0ce", background: "#fdf6f5", padding: "16px 20px", marginBottom: 32 },
  errorHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  errorTitle: { fontSize: 10, letterSpacing: "0.14em", color: "#c0392b", fontWeight: 500 },
  errorText: { fontSize: 13, color: "#444", lineHeight: 1.6 },
  errorCode: { fontSize: 10, color: "#bbb", letterSpacing: "0.1em", marginTop: 6 },
  tipsSection: { marginBottom: 32 },
  tipsTitle: { fontSize: 10, letterSpacing: "0.14em", color: "#aaa", marginBottom: 14 },
  tipsList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 10 },
  tipItem: { display: "flex", gap: 12, fontSize: 13, color: "#555", lineHeight: 1.5 },
  tipDot: { color: "#ccc", flexShrink: 0 },
  support: {},
  supportLabel: { fontSize: 10, letterSpacing: "0.14em", color: "#aaa", marginBottom: 6 },
  supportText: { fontSize: 13, color: "#555" },
  supportLink: { color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: 3 },
  aside: {},
  card: { border: "1px solid #e8e8e8", padding: "28px 24px" },
  cardTitle: { fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 20 },
  cardDivider: { height: 1, background: "#e8e8e8", margin: "16px 0" },
  retrySection: { marginBottom: 4 },
  retryLabel: { fontSize: 10, letterSpacing: "0.14em", color: "#aaa", marginBottom: 12 },
  methodBtns: { display: "flex", gap: 8 },
  methodBtn: { flex: 1, padding: "10px 6px", border: "1px solid #e0e0e0", background: "#fff", color: "#1a1a1a", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.18s", fontSize: 13 },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: "#888", fontWeight: 300 },
  summaryValue: { fontSize: 13, color: "#888" },
  totalLabel: { fontSize: 15, fontWeight: 600 },
  btnPrimary: { width: "100%", padding: "16px", background: "#1a1a1a", color: "#fff", border: "none", fontSize: 12, letterSpacing: "0.14em", cursor: "pointer", marginTop: 24, transition: "opacity 0.2s", display: "block", textAlign: "center" },
  btnSecondary: { display: "block", width: "100%", padding: "12px", background: "transparent", border: "none", fontSize: 11, letterSpacing: "0.1em", color: "#888", cursor: "pointer", marginTop: 8, textAlign: "center" },
};