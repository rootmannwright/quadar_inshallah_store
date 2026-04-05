import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomerPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold tracking-wide">Customer Dashboard</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="border px-4 py-2 text-sm hover:bg-white hover:text-black transition"
        >
          Logout
        </button>
      </div>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-light">
          Welcome back, <span className="font-semibold">{user?.name}</span>
        </h2>
        <p className="text-gray-400 mt-2">Manage your account and explore your activity.</p>
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="border p-6 rounded-2xl backdrop-blur bg-white/5"
        >
          <h3 className="text-lg mb-2">Profile</h3>
          <p className="text-sm text-gray-400">Name: {user?.name}</p>
          <p className="text-sm text-gray-400">Email: {user?.email}</p>
        </motion.div>

        {/* Orders */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="border p-6 rounded-2xl backdrop-blur bg-white/5"
        >
          <h3 className="text-lg mb-2">Orders</h3>
          <p className="text-sm text-gray-400">You have no orders yet.</p>
        </motion.div>

        {/* Cart */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="border p-6 rounded-2xl backdrop-blur bg-white/5"
        >
          <h3 className="text-lg mb-2">Cart</h3>
          <p className="text-sm text-gray-400">Your cart is empty.</p>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <a
          href="/"
          className="inline-block border px-6 py-3 hover:bg-white hover:text-black transition"
        >
          Go Shopping
        </a>
      </motion.div>
    </div>
  );
}
