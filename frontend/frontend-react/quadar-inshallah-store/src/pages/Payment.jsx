import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/payment.css";

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
                throw new Error("Usuário não autenticado.");
            }

            console.log("🛒 CART ITEMS:", cartItems);

            const formattedItems = cartItems.map((item) => {
                const productId =
                    item._id ||
                    item.productId ||
                    item.id ||
                    item.product?._id;

                if (!productId) {
                    console.error("❌ Item inválido:", item);
                    throw new Error("Produto inválido no carrinho.");
                }

                const quantity = Number(item.quantity || item.qty || 1);

                if (!quantity || quantity < 1) {
                    throw new Error("Quantidade inválida.");
                }

                return { productId, quantity };
            });

            console.log("📦 ENVIANDO:", formattedItems);

            const response = await fetch(STRIPE_CHECKOUT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ items: formattedItems }),
            });

            const data = await response.json().catch(() => null);

            console.log("📡 STATUS:", response.status);
            console.log("📡 RESPONSE:", data);

            if (!response.ok) {
                throw new Error(data?.error || "Erro ao iniciar pagamento");
            }

            if (!data?.url) {
                throw new Error("Stripe não retornou URL");
            }

            window.location.href = data.url;

        } catch (err) {
            console.error("❌ Stripe checkout error:", err);
            setError(err.message);
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