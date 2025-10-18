import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  image_url: string;
}

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Error al cargar juego:", error);
      else setGame(data);

      setLoading(false);
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = () => {
    if (!game) return;

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const alreadyAdded = cart.some((item: Game) => item.id === game.id);

      if (!alreadyAdded) {
        const updatedCart = [...cart, game];
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setAddedToCart(true);

        toast({
          title: "✅ Juego agregado",
          description: `${game.titulo} se guardó correctamente en tu carrito.`,
        });
      } else {
        toast({
          title: "⚠️ Ya está agregado",
          description: `${game.titulo} ya está en tu carrito.`,
        });
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      toast({
        title: "❌ Error",
        description: "Ocurrió un problema al guardar el juego.",
      });
    }
  };

  if (loading) return <p className="text-center text-gray-400 mt-10">Cargando juego...</p>;
  if (!game) return <p className="text-center text-red-400 mt-10">Juego no encontrado.</p>;

  return (
    <div className="min-h-screen bg-background text-white py-12 px-6">
      <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
        <img
          src={game.image_url}
          alt={game.titulo}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />
        <h1 className="text-4xl font-bold mb-4">{game.titulo}</h1>
        <p className="text-gray-400 text-lg mb-6">{game.descripcion}</p>
        <p className="text-blue-400 text-2xl font-semibold mb-8">
          Precio: ${game.precio}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAddToCart}
            className={`${
              addedToCart ? "bg-green-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white font-semibold py-2 px-4 rounded-lg transition`}
          >
            {addedToCart ? "✅ Agregado al carrito" : "🛒 Agregar al carrito"}
          </button>

          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ⬅ Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
