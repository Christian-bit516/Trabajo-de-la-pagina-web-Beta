import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface Game {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  image_url?: string;
  disponible?: boolean;
}

const FeaturedGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) {
        console.error("Error al cargar juegos:", error);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    };
    fetchGames();

    const listener = (e: any) => setQuery((e && e.detail) || "");
    window.addEventListener("gameSearch", listener as EventListener);
    return () => window.removeEventListener("gameSearch", listener as EventListener);
  }, []);

  const lower = query?.toLowerCase?.() || "";
  const filtered = games.filter(
    (g) =>
      !query ||
      g.titulo.toLowerCase().includes(lower) ||
      (g.descripcion || "").toLowerCase().includes(lower)
  );

  const available = filtered.filter((g) => g.disponible !== false);
  const upcoming = filtered.filter((g) => g.disponible === false);

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Cargando juegos...</p>;
  }

  return (
    <section className="py-12 px-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-8">🎮 Juegos</h2>

      {query && (
        <p className="text-sm text-gray-300 mb-4">Resultados para: <strong>{query}</strong></p>
      )}

      {/* Disponibles */}
      <div>
        {available.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {available.map((game) => (
              <div key={game.id} className="bg-gray-800 p-5 rounded-2xl shadow hover:scale-105 transition-transform">
                {game.image_url && (
                  <img src={game.image_url} alt={game.titulo} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-xl font-semibold">{game.titulo}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-3">{game.descripcion}</p>
                <p className="font-bold text-blue-400 mb-4">${game.precio}</p>

                <Button
                  variant="default"
                  className="w-full"
                  onClick={() =>
                    addToCart({
                      id: game.id,
                      titulo: game.titulo,
                      descripcion: game.descripcion,
                      precio: Number(game.precio),
                      image_url: game.image_url,
                    })
                  }
                >
                  🛒 Agregar al carrito
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 mb-6">No se encontraron juegos disponibles que coincidan.</p>
        )}
      </div>

      {/* Próximamente */}
      {upcoming.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-4">🕓 Próximamente</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {upcoming.map((game) => (
              <div key={game.id} className="bg-gray-800/60 p-5 rounded-2xl shadow opacity-80">
                {game.image_url && (
                  <img src={game.image_url} alt={game.titulo} className="w-full h-48 object-cover rounded-lg mb-4 filter grayscale" />
                )}
                <h4 className="text-lg font-semibold">{game.titulo}</h4>
                <p className="text-gray-400 text-sm mb-2 line-clamp-3">{game.descripcion}</p>
                <div className="mt-2 text-sm text-yellow-300 font-medium">🕓 Próximamente</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default FeaturedGames;
