import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/payment.css";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const STRIPE_CHECKOUT_URL = `${BASE_URL}/api/payments/checkout-session`;
const formatPrice = (value) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value || 0);

export default function Payments() {
    const { state } = useLocation();

    const cartItems =
        state?.items || JSON.parse(localStorage.getItem("checkoutItems") || "[]");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
    );

    const handleStripe = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Você precisa estar logado");
                throw new Error("Usuário não autenticado.");
            }

            const formattedItems = cartItems.map((item) => {
                const productId =
                    item._id ||
                    item.productId ||
                    item.id ||
                    item.product?._id;

                if (!productId) {
                    toast.error("Produto inválido no carrinho");
                    throw new Error("Produto inválido no carrinho.");
                }

                const quantity = Number(item.quantity || item.qty || 1);

                if (!quantity || quantity < 1) {
                    toast.error("Quantidade inválida");
                    throw new Error("Quantidade inválida.");
                }

                return { productId, quantity };
            });

            const response = await fetch(STRIPE_CHECKOUT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ items: formattedItems }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || "Erro ao iniciar pagamento");
            }

            if (!data?.url) {
                throw new Error("Stripe não retornou URL");
            }

            // 🔥 TOAST DE SUCESSO ANTES DO REDIRECIONAMENTO
            toast.success("Redirecionando para pagamento...");

            // pequeno delay pra UX ficar suave
            setTimeout(() => {
                window.location.href = data.url;
            }, 600);

        } catch (err) {
            console.error("❌ Stripe checkout error:", err);
            setError(err.message);
            toast.error(err.message || "Erro no pagamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-grid">

                {/* LEFT */}
                <div className="payment-left">
                    <h1 className="payment-title">Pagamento</h1>

                    <button
                        className="payment-button"
                        onClick={handleStripe}
                        disabled={loading || cartItems.length === 0}
                    >
                        {loading ? "Processando..." : "Pagar com Stripe"}
                    </button>

                    {/*
  <button
    className="payment-button secondary"
    onClick={handlePix}
    disabled={loading || cartItems.length === 0}
  >
    {loading ? "Gerando PIX..." : "Pagar com PIX"}
  </button>
  */}


                    {error && <p className="payment-error">{error}</p>}
                </div>

                {/* RIGHT */}
                <div className="payment-right">
                    <h2 className="summary-title">Resumo</h2>

                    <div className="summary-items">
                        {cartItems.map((item, index) => (
                            <div className="summary-item" key={index}>
                                <span>{item.name}</span>
                                <span>
                                    {formatPrice(item.price)} x {item.quantity}
                                </span>
                                <span>
                                    {formatPrice((item.price || 0) * (item.quantity || 0))}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-total">
                        <span>Total</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}