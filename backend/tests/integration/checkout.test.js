import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";


const mockSessionCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.unstable_mockModule("stripe", () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockSessionCreate,
        },
      },
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    })),
  };
});


const mockProductFind = jest.fn();
const mockOrderCreate = jest.fn();
const mockOrderFindById = jest.fn();

jest.unstable_mockModule("../../models/Product.js", () => ({
  default: {
    find: mockProductFind,
  },
}));

jest.unstable_mockModule("../../models/Order.js", () => ({
  default: {
    create: mockOrderCreate,
    findById: mockOrderFindById,
  },
}));

// imports after mocks
const { createCheckoutSession, handleWebhook } =
  await import("../../controllers/paymentController.js");

// Helpers for mocks and test data
const mockReq = (overrides = {}) => ({
  body: {},
  headers: {},
  user: { id: new mongoose.Types.ObjectId().toString() },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const fakeProduct = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: "Produto Teste",
  price: 100,
  image: "https://img.com/test.jpg",
  ...overrides,
});

const fakeOrder = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  status: "pending_payment",
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// Tests for createCheckoutSession
describe("createCheckoutSession", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.CLIENT_URL = "http://localhost:5173";

    jest.clearAllMocks();
  });

  it("400 se body vazio", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se produtos não encontrados", async () => {
    mockProductFind.mockResolvedValue([]);

    const req = mockReq({
      body: {
        items: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }],
      },
    });

    const res = mockRes();

    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("cria checkout com sucesso", async () => {
    const product = fakeProduct();

    mockProductFind.mockResolvedValue([product]);
    mockOrderCreate.mockResolvedValue(fakeOrder());

    mockSessionCreate.mockResolvedValue({
      id: "cs_test",
      url: "https://checkout.stripe.com/pay/cs_test",
    });

    const req = mockReq({
      body: {
        items: [{ productId: product._id.toString(), quantity: 2 }],
      },
    });

    const res = mockRes();

    await createCheckoutSession(req, res);

    expect(res.json).toHaveBeenCalledWith({
      url: "https://checkout.stripe.com/pay/cs_test",
    });
  });

  it("retorna erro se stripe não retornar url", async () => {
    const product = fakeProduct();

    mockProductFind.mockResolvedValue([product]);
    mockOrderCreate.mockResolvedValue(fakeOrder());

    mockSessionCreate.mockResolvedValue({
      id: "cs_test",
      url: null,
    });

    const req = mockReq({
      body: {
        items: [{ productId: product._id.toString(), quantity: 1 }],
      },
    });

    const res = mockRes();

    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Tests for handleWebhook are at the end of this file since they require more complex setup and mocks
describe("handleWebhook", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    jest.clearAllMocks();
  });

  it("400 assinatura inválida", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = mockReq({
      headers: { "stripe-signature": "bad" },
      body: Buffer.from("{}"),
    });

    const res = mockRes();

    await handleWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("marca pedido como pago", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const order = fakeOrder();

    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { orderId },
          payment_intent: "pi_123",
        },
      },
    });

    mockOrderFindById.mockResolvedValue(order);

    const req = mockReq({
      headers: { "stripe-signature": "ok" },
      body: Buffer.from("{}"),
    });

    const res = mockRes();

    await handleWebhook(req, res);

    expect(order.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("ignora evento desconhecido", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    });

    const req = mockReq({
      headers: { "stripe-signature": "ok" },
      body: Buffer.from("{}"),
    });

    const res = mockRes();

    await handleWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});