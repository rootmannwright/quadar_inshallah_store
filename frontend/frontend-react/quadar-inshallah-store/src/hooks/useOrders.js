import { useState, useEffect } from "react";
import api from "../api/axios";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (order) => {
    const { data } = await api.post("/orders", order);
    setOrders((prev) => [...prev, data]);
    return data;
  };

  const deleteOrder = async (orderId) => {
    await api.delete(`/orders/${orderId}`);
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, fetchOrders, createOrder, deleteOrder };
};