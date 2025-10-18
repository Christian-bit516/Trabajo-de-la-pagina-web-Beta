import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import heroImage from "@/assets/hero-gaming.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Gaming hero background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Animated Glow Effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
            🎮 Nuevo Lanzamiento
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-shine bg-[length:200%_auto]">
              El Futuro
            </span>
            <br />
            <span className="text-foreground">del Gaming</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg">
            Descubre miles de juegos increíbles. Únete a millones de jugadores en la plataforma de gaming definitiva.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all duration-300"
            >
              <Play className="h-5 w-5" />
              Jugar Ahora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Añadir a Lista
            </Button>
          </div>

          <div className="flex gap-8 pt-8 text-sm">
            <div>
              <div className="text-2xl font-bold text-primary">10M+</div>
              <div className="text-muted-foreground">Jugadores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">5K+</div>
              <div className="text-muted-foreground">Juegos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">50+</div>
              <div className="text-muted-foreground">Géneros</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
