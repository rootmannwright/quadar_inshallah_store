import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("SUA_PUBLISHABLE_KEY_AQUI");

export default function CheckoutButton({ cartItems }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const res = await fetch("http://localhost:4242/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await res.json();
    stripe.redirectToCheckout({ sessionId: data.id || data.url });
  };

  return <button onClick={handleCheckout}>Finalizar Compra</button>;
}