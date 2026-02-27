import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    total: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "processing_payment",
        "paid",
        "cancelled",
        "refunded"
      ],
      default: "pending_payment",
      index: true
    },

    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Order", OrderSchema);