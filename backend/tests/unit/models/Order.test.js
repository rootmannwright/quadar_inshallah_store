import Order from "../../../models/Order.js";
import mongoose from "mongoose";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

describe("Order.markAsPaid", () => {
  let order;

  beforeEach(() => {
    order = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: "Produto teste",
          price: 100,
          quantity: 1,
        },
      ],
      total: 100,
      status: "pending_payment",
    });

    order.save = jest.fn().mockResolvedValue(order);
  });

  it("deve marcar pedido como pago corretamente", async () => {
    await order.markAsPaid("pi_123");

    expect(order.status).toBe("paid");
    expect(order.paymentIntentId).toBe("pi_123");
    expect(order.paidAt).toBeInstanceOf(Date);
  });

  it("deve chamar save ao final", async () => {
    await order.markAsPaid("pi_456");

    expect(order.save).toHaveBeenCalledTimes(1);
  });

  it("não deve perder itens do pedido", async () => {
    const originalItemsLength = order.items.length;

    await order.markAsPaid("pi_789");

    expect(order.items.length).toBe(originalItemsLength);
  });
});