import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Game {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  image_url: string;
}

const Cart = () => {
  const [cart, setCart] = useState<Game[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((game) => game.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, game) => sum + game.precio, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">🛒 Tu carrito está vacío</h2>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8">🛍️ Tu carrito</h1>

        <div className="space-y-6">
          {cart.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg"
            >
              <img
                src={game.image_url}
                alt={game.titulo}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{game.titulo}</h3>
                <p className="text-gray-400 text-sm">{game.descripcion}</p>
                <p className="font-bold text-blue-400 mt-1">${game.precio}</p>
              </div>
              <button
                onClick={() => removeFromCart(game.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition"
              >
                ❌ Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">
            Total: <span className="text-blue-400">${total.toFixed(2)}</span>
          </h2>

          <div className="flex gap-4">
            <button
              onClick={clearCart}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Vaciar carrito
            </button>

            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              💳 Proceder al pago
            </button>
          </div>
        </div>

        <Link
          to="/"
          className="block text-center mt-10 text-blue-400 hover:underline"
        >
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
};

export default Cart;
