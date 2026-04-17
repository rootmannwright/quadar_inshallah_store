import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/success.css";

export default function PaymentSuccess() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="ps-root">
      <main className={`ps-main ${visible ? "is-visible" : ""}`}>
        
        {/* LEFT */}
        <section className="ps-left">
          <div className="ps-icon">
            <div className="ps-check">
              ✓
            </div>
          </div>

          <h1 className="ps-title">Pedido confirmado</h1>

          <p className="ps-subtitle">
            Obrigado pela sua compra. Enviamos a confirmação por e-mail.
          </p>

          {sessionId && (
            <div className="ps-order-box">
              <span>Número do pedido</span>
              <strong>{sessionId.slice(0, 24).toUpperCase()}</strong>
            </div>
          )}

          <div className="ps-info-grid">
            <div>
              <span>Status</span>
              <strong className="success">Pagamento aprovado</strong>
            </div>

            <div>
              <span>Entrega</span>
              <strong>5–8 dias úteis</strong>
            </div>
          </div>

          <div className="ps-actions">
            <button onClick={() => navigate("/products")}>
              CONTINUAR COMPRANDO
            </button>

            <button
              className="ghost"
              onClick={() => navigate("/customer")}
            >
              VER MEUS PEDIDOS
            </button>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="ps-right">
          <div className="ps-card">
            <h2>RESUMO</h2>

            <div className="divider" />

            <div className="row">
              <span>Subtotal</span>
              <span>—</span>
            </div>

            <div className="row">
              <span>Impostos</span>
              <span>—</span>
            </div>

            <div className="row">
              <span>Frete</span>
              <span>—</span>
            </div>

            <div className="divider" />

            <div className="row total">
              <span>Total</span>
              <span className="success">Confirmado ✓</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}