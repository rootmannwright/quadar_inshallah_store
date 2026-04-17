import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cancel.css"

const CHECKLIST_ITEMS = [
  {
    num: "01",
    label: "Dados do cartão",
    desc: "Confirme número, validade e CVV do seu cartão",
  },
  {
    num: "02",
    label: "Limite disponível",
    desc: "Verifique se há limite suficiente para o valor",
  },
  {
    num: "03",
    label: "Outro método",
    desc: "Tente Pix, boleto ou um cartão diferente",
  },
  {
    num: "04",
    label: "Contato com o banco",
    desc: "Seu banco pode ter bloqueado a compra por segurança",
  },
];

export default function PaymentFailed({
  onRetry,
  onBackToCart,
  supportEmail = "ajuda@quadar.com",
}) {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) return onRetry();
    navigate("/cart");
  };

  const handleBack = () => {
    if (onBackToCart) return onBackToCart();
    navigate("/cart");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="qd-root">


        {/* ── Content ── */}
        <div className="qd-main">
          {/* Left */}
          <div className="qd-left">
            <div>
              <div className={`qd-status-tag qd-animate qd-animate-1 ${mounted ? "" : ""}`}>
                <span className="qd-status-dot" />
                Transação não processada
              </div>

              <div className={`qd-headline-block qd-animate qd-animate-2`}>
                <p className="qd-overline">Erro de pagamento</p>
                <h1 className="qd-headline">
                  Pagamento
                  <br />
                  <em>não</em>
                  <br />
                  realizado.
                </h1>
              </div>

              <div className={`qd-divider qd-animate qd-animate-3`} />

              <p className={`qd-subtitle qd-animate qd-animate-3`}>
                Não foi possível processar sua transação neste momento. Seus
                itens permanecem salvos no carrinho e estão à sua espera.
              </p>
            </div>

            <div className={`qd-actions qd-animate qd-animate-4`}>
              <button className="qd-btn-primary" onClick={handleRetry}>
                Tentar novamente
              </button>
              <button className="qd-btn-ghost" onClick={handleBack}>
                Voltar ao carrinho
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="qd-right">
            <p className={`qd-error-code qd-animate qd-animate-1`}>402</p>

            <div className={`qd-animate qd-animate-3`}>
              <p className="qd-checklist-title">O que verificar</p>
              <ul className="qd-checklist">
                {CHECKLIST_ITEMS.map((item, i) => (
                  <li key={item.num} style={{ animationDelay: `${0.35 + i * 0.08}s` }} className="qd-animate">
                    <span className="qd-item-num">{item.num}</span>
                    <div className="qd-item-text">
                      <p className="qd-item-label">{item.label}</p>
                      <p className="qd-item-desc">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}