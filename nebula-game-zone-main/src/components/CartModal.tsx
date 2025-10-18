import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((s, it) => s + it.precio * (it.quantity || 1), 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">🛒 Tu carrito está vacío</h2>
          <Link to="/" className="text-blue-400 hover:underline">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">🛍️ Tu carrito</h1>
        <div className="space-y-4">
          {cartItems.map((it) => (
            <div key={it.id} className="flex gap-4 items-center bg-gray-800 p-4 rounded-lg">
              {it.image_url && <img src={it.image_url} className="w-24 h-24 object-cover rounded" alt={it.titulo} />}
              <div className="flex-1">
                <div className="font-semibold">{it.titulo}</div>
                <div className="text-gray-400">{it.descripcion}</div>
                <div className="text-blue-400 font-bold mt-1">${it.precio.toFixed(2)}</div>
              </div>
              <button onClick={() => removeFromCart(it.id)} className="bg-red-600 text-white px-3 py-2 rounded">Eliminar</button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-bold">Total: <span className="text-green-400">${total.toFixed(2)}</span></div>
          <div className="flex gap-3">
            <button onClick={clearCart} className="bg-gray-700 px-4 py-2 rounded">Vaciar carrito</button>
            <button onClick={() => alert("Checkout simulado")} className="bg-green-600 px-4 py-2 rounded">💳 Proceder al pago</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
