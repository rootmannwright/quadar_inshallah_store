// routes/paymentRoutes.js
import express from "express";
import Stripe from "stripe";
import Joi from "joi";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();


const getStripe = () => {
if (!process.env.STRIPE_SECRET_KEY) {
throw new Error("Stripe secret key not defined");
}

return new Stripe(process.env.STRIPE_SECRET_KEY);
};

router.post(
"/create-intent/:orderId",
authMiddleware,
async (req, res) => {
try {
const schema = Joi.object({
orderId: Joi.string().required(),
});

const { error, value } = schema.validate(req.params);

if (error) {
return res.status(400).json({ error: error.details[0].message });
}
const { orderId } = value;

// Validate ObjectId BEFORE querying DB
if (!mongoose.Types.ObjectId.isValid(orderId)) {
return res.status(400).json({ error: "Invalid order ID format" });
}

const order = await Order.findById(orderId).select(
"total userId status"
);

if (!order) {
return res.status(404).json({ error: "Order not found" });
}

// Optional security check (recommended)
if (order.userId.toString() !== req.user.id) {
return res.status(403).json({ error: "Unauthorized access to order" });
}

if (order.status === "paid") {
return res.status(400).json({ error: "Order already paid" });
}

const stripe = getStripe();

const paymentIntent = await stripe.paymentIntents.create({
amount: Math.round(order.total * 100),
currency: "brl",
metadata: {
orderId: order._id.toString(),
userId: req.user.id,
},
});

return res.json({
clientSecret: paymentIntent.client_secret,
});
} catch (err) {
console.error("Error creating payment intent:", err.message);

return res.status(500).json({
error: "Internal server error while creating payment",
});
}
}
);

router.post("/checkout-session", async (req, res) => {
  try {
    const schema = Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            price: Joi.number().positive().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
    });

const { error, value } = schema.validate(req.body);

if (error) {
return res.status(400).json({ error: error.details[0].message });
}

const { items } = value;

    const stripe = getStripe();

    const line_items = items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

const session = await stripe.checkout.sessions.create({
payment_method_types: ["card"],
mode: "payment",
line_items,
success_url: `${process.env.CLIENT_URL}/success`,
cancel_url: `${process.env.CLIENT_URL}/cancel`,
});

return res.json({ url: session.url });
} catch (err) {
console.error("Checkout session error:", err.message);

return res.status(500).json({
error: "Internal server error while creating checkout session",
});
}
});

export default router;
