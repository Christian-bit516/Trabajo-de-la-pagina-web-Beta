// src/components/FeaturedGames.tsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Clock } from "lucide-react"; // <- Añadido ShoppingCart y Clock aquí

// Interfaz para el juego
interface Game {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  image_url?: string;
  disponible?: boolean;
}

// Componente Skeleton para la tarjeta de juego
const GameCardSkeleton = () => (
  <div className="bg-card p-5 rounded-2xl shadow">
    <Skeleton className="w-full h-48 rounded-lg mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-5/6 mb-4" />
    <Skeleton className="h-6 w-1/4 mb-4" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

const FeaturedGames = () => {
  // --- Estados ---
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { addToCart } = useCart();

  // --- Efectos ---

  // Cargar juegos y escuchar cambios de búsqueda
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones en componente desmontado

    const fetchGames = async () => {
      setLoading(true); // Indicar inicio de carga
      try {
        const { data, error } = await supabase.from("games").select("*");
        if (error) throw error;
        if (isMounted) {
          setGames(data || []);
        }
      } catch (error: any) {
        console.error("Error al cargar juegos:", error.message);
        // Aquí podrías mostrar un mensaje de error al usuario
      } finally {
        if (isMounted) {
          setLoading(false); // Indicar fin de carga
        }
      }
    };

    fetchGames();

    // Listener para el evento de búsqueda
    const handleGameSearch = (e: CustomEvent<string>) => {
      if (isMounted) {
        setQuery(e.detail || "");
      }
    };

    window.addEventListener("gameSearch", handleGameSearch as EventListener);

    // Limpieza al desmontar
    return () => {
      isMounted = false;
      window.removeEventListener("gameSearch", handleGameSearch as EventListener);
    };
  }, []); // Solo se ejecuta al montar y desmontar

  // --- Filtrado ---
  const filteredGames = useCallback(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return games; // Retornar todos si no hay búsqueda

    return games.filter(
      (g) =>
        g.titulo.toLowerCase().includes(lowerQuery) ||
        (g.descripcion || "").toLowerCase().includes(lowerQuery)
    );
  }, [games, query]);

  const availableGames = filteredGames().filter((g) => g.disponible !== false);
  const upcomingGames = filteredGames().filter((g) => g.disponible === false);

  // --- Renderizado ---

  // Estado de carga con Skeletons
  if (loading) {
    return (
      <section className="py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">🎮 Juegos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Ajustado grid para skeletons */}
          {[...Array(6)].map((_, i) => <GameCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  // Contenido principal
  return (
    <section className="py-12 px-6 text-foreground">
      <h2 className="text-3xl font-bold text-center mb-8">🎮 Juegos</h2>

      {query && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Mostrando resultados para: <strong className="text-foreground">{query}</strong>
        </p>
      )}

      {/* Juegos Disponibles */}
      {availableGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"> {/* Ajustado grid */}
          {availableGames.map((game) => (
            <div key={game.id} className="bg-card p-5 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"> {/* Flex col para alinear botón */}
              {game.image_url ? (
                <img src={game.image_url} alt={game.titulo} className="w-full h-48 object-cover rounded-lg mb-4" />
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center text-muted-foreground">
                  Sin imagen
                </div>
              )}
              <div className="flex-grow"> {/* Div para que el contenido crezca y empuje el botón */}
                <h3 className="text-xl font-semibold mb-1 truncate">{game.titulo}</h3>
                <p className="text-muted-foreground text-sm mb-3 h-10 line-clamp-2">{game.descripcion || "Sin descripción"}</p>
                <p className="font-bold text-lg text-primary mb-4">${game.precio.toFixed(2)}</p>
              </div>
              <Button
                variant="default"
                className="w-full mt-auto transition-transform transform active:scale-95" // mt-auto para empujar al fondo
                onClick={() => addToCart(game)} // Pasar el objeto 'game' completo
              >
                <ShoppingCart className="h-4 w-4 mr-2" /> Agregar al carrito
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !query && games.length === 0 ? // Si no hay búsqueda y no hay juegos en total
        <p className="text-center text-muted-foreground mb-12">No hay juegos disponibles por el momento.</p>
        : // Si hay búsqueda pero no resultados, o si hay juegos pero no coinciden
        <p className="text-center text-muted-foreground mb-12">No se encontraron juegos disponibles que coincidan.</p>
      )}

      {/* Juegos Próximamente */}
      {upcomingGames.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-6 text-center">🕓 Próximamente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Ajustado grid */}
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-card/60 p-5 rounded-2xl shadow border border-border/30 opacity-80 flex flex-col"> {/* Flex col */}
                {game.image_url ? (
                  <img src={game.image_url} alt={`${game.titulo} (Próximamente)`} className="w-full h-48 object-cover rounded-lg mb-4 filter grayscale" />
                 ) : (
                   <div className="w-full h-48 bg-muted/50 rounded-lg mb-4 flex items-center justify-center text-muted-foreground filter grayscale">
                     Sin imagen
                   </div>
                 )}
                <div className="flex-grow"> {/* Div para crecer */}
                    <h4 className="text-lg font-semibold mb-1 truncate">{game.titulo}</h4>
                    <p className="text-muted-foreground text-sm mb-3 h-10 line-clamp-2">{game.descripcion || "Sin descripción"}</p>
                </div>
                <div className="mt-2 text-sm text-yellow-400 font-medium flex items-center justify-center gap-1 pt-4 border-t border-border/20"> {/* Separador sutil */}
                  <Clock className="h-4 w-4" /> Próximamente
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default FeaturedGames;