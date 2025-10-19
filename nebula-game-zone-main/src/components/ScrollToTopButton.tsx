// src/components/ScrollToTopButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils'; // Asegúrate que cn está importado

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Muestra u oculta el botón basado en la posición del scroll
  const toggleVisibility = () => {
    if (window.scrollY > 300) { // Mostrar después de 300px de scroll
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Vuelve suavemente al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Desplazamiento suave
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <Button
      variant="default" // O "outline" si prefieres
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-opacity duration-300 ease-in-out hover:scale-110",
        "bg-primary hover:bg-primary/90 text-primary-foreground", // Estilos de color
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none' // Control de visibilidad
      )}
      aria-label="Volver al inicio"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default ScrollToTopButton;