import { useState } from "react"
import CheckoutButton from "../components/CheckoutButton"

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      name: "Laptop",
      model: "XPS 13",
      hsCode: "847130",
      quantity: 1,
      weight: 2.5,
      perPieceRate: 999.99,
      color: "Silver",
      deliveryMethod: "Air",
      description: "A powerful and lightweight laptop with excellent performance.",
      showDescription: false,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Smartphone",
      model: "iPhone 14",
      hsCode: "851712",
      quantity: 2,
      weight: 0.5,
      perPieceRate: 799.99,
      color: "Black",
      deliveryMethod: "Ship",
      description: "The latest iPhone with advanced camera and processing power.",
      showDescription: false,
      image: "https://via.placeholder.com/150",
    },
  ])

  const incrementQuantity = (index) => {
    const updated = [...cartItems]
    updated[index].quantity++
    setCartItems(updated)
  }

  const decrementQuantity = (index) => {
    const updated = [...cartItems]
    if (updated[index].quantity > 1) {
      updated[index].quantity--
      setCartItems(updated)
    }
  }

  const removeItem = (index) => {
    if (confirm("Remove item?")) {
      setCartItems(cartItems.filter((_, i) => i !== index))
    }
  }

  const toggleDescription = (index) => {
    const updated = [...cartItems]
    updated[index].showDescription = !updated[index].showDescription
    setCartItems(updated)
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.perPieceRate * item.quantity,
    0
  )

  const tax = subtotal * 0.075
  const shipping = 5
  const total = subtotal + tax + shipping

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 && (
        <p className="text-gray-500 text-center">Your cart is empty</p>
      )}

      {cartItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">{item.model}</p>
                <p className="text-sm text-gray-400">HS: {item.hsCode}</p>
              </div>
            </div>

            <button
              onClick={() => removeItem(index)}
              className="text-red-600"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => decrementQuantity(index)}
              className="px-3 py-1 border"
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => incrementQuantity(index)}
              className="px-3 py-1 border"
            >
              +
            </button>
          </div>

          <p className="mt-2 font-medium">
            Price: ${item.perPieceRate.toFixed(2)}
          </p>

          <p className="font-bold">
            Total: ${(item.perPieceRate * item.quantity).toFixed(2)}
          </p>

          <button
            onClick={() => toggleDescription(index)}
            className="text-blue-600 text-sm mt-2"
          >
            {item.showDescription ? "Hide" : "Show"} description
          </button>

          {item.showDescription && (
            <p className="text-sm text-gray-600 mt-2">
              {item.description}
            </p>
          )}
        </div>
      ))}

      {cartItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-10">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <CheckoutButton cartItems={cartItems} />
        </div>
      )}
    </div>
  )
}