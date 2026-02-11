import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default stripe;

const app = express();
app.use(express.json());
app.use(express.static("public"));

// adjust the domain as needed, especially if you're deploying to production.
const YOUR_DOMAIN = "http://localhost:4242";

app.post("/create-checkout-session", async (req, res) => {
  const { priceId, quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: quantity || 1 }],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success.html`, 
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("StripeService rodando na porta 4242"));

