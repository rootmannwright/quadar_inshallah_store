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
Joi.alternatives().try(
Joi.object({
productId: Joi.string().required(),
quantity: Joi.number().integer().min(1).required(),
}),
Joi.object({
name: Joi.string().required(),
price: Joi.number().positive().required(),
quantity: Joi.number().integer().min(1).required(),
})
)
)
.min(1)
.required(),
});

const { error, value } = schema.validate(req.body);

if (error) {
return res.status(400).json({ error: error.details[0].message });
}

const { items } = value;

const usingProductIdPayload = items.every((item) => item.productId);
const usingInlinePayload = items.every((item) => item.name && item.price);

if (!usingProductIdPayload && !usingInlinePayload) {
return res.status(400).json({
error: "All checkout items must follow the same payload format",
});
}

let line_items = [];

if (usingProductIdPayload) {
const ids = items.map((item) => item.productId);

const products = await Product.find({
_id: { $in: ids.filter((id) => mongoose.Types.ObjectId.isValid(id)) },
}).select("name price");

if (!products.length) {
return res.status(404).json({ error: "Products not found" });
}

line_items = items.map((item) => {
const product = products.find((p) => p._id.toString() === item.productId);

if (!product) {
throw new Error(`Product not found: ${item.productId}`);
}

const price = Number(product.price);

if (!price || Number.isNaN(price)) {
throw new Error(`Invalid product price: ${product.name}`);
}

return {
price_data: {
currency: "brl",
product_data: {
name: product.name,
},
unit_amount: Math.round(price * 100),
},
quantity: item.quantity,
};
});
} else {
line_items = items.map((item) => ({
price_data: {
currency: "brl",
product_data: {
name: item.name,
},
unit_amount: Math.round(item.price * 100),
},
quantity: item.quantity,
}));
}

const stripe = getStripe();

if (!process.env.CLIENT_URL) {
throw new Error("CLIENT_URL not defined");
}

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