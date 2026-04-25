import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

// Order schema
const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "brl",
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "processing_payment",
        "paid",
        "cancelled",
        "refunded",
      ],
      default: "pending_payment",
      index: true,
    },

    stripeSessionId: {
      type: String,
      index: true,
    },

    paymentIntentId: {
      type: String,
      index: true,
      sparse: true,
    },

    paidAt: Date,
    cancelledAt: Date,

    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String, default: "BR" },
    },
  },
  {
    timestamps: true,
  }
);

// Index
OrderSchema.index({ user: 1, createdAt: -1 });

OrderSchema.methods.markAsPaid = function (paymentIntentId) {
  this.status = "paid";
  this.paymentIntentId = paymentIntentId;
  this.paidAt = new Date();
  return this.save();
};

OrderSchema.methods.markAsCancelled = function () {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  return this.save();
};

export default mongoose.model("Order", OrderSchema);