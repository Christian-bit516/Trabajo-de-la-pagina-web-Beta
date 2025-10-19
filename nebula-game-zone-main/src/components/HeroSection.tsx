// src/components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Play, ListPlus, Gamepad } from "lucide-react"; // Cambiado Plus por ListPlus y añadido Gamepad
import heroImage from "@/assets/hero-gaming.jpg";
import { motion } from "framer-motion"; // Importar motion para animaciones

const HeroSection = () => {
  return (
    // Sección principal con overflow-hidden y fondo radial sutil
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden bg-gradient-radial-glow py-16 md:py-24">
      {/* Capa de Imagen de Fondo */}
      <div className="absolute inset-0 z-0 opacity-15"> {/* Menor opacidad */}
        <img
          src={heroImage}
          alt="" // Alt vacío para imagen decorativa
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        {/* Overlays más oscuros y extensos */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />
      </div>

      {/* Glows Animados - Más grandes y sutiles */}
      <motion.div
        className="absolute -top-1/3 -left-1/4 w-3/5 h-3/5 bg-primary/5 rounded-full blur-[180px] opacity-60"
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 w-3/5 h-3/5 bg-secondary/5 rounded-full blur-[180px] opacity-50"
        animate={{ scale: [1, 0.95, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Contenido Principal */}
      <div className="container relative z-10">
        <motion.div // Animar la entrada del contenido
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="max-w-3xl text-center md:text-left mx-auto md:mx-0 space-y-6"
         >
          {/* Badge estilizado */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card/80 border border-primary/30 rounded-full text-sm font-medium mb-4 backdrop-blur-sm text-primary animate-float">
            <Gamepad className="h-4 w-4" />
            <span>Plataforma Definitiva</span>
          </div>

          {/* Título Principal con Glow */}
          <h1 className="text-5xl md:text-7xl font-bold !leading-tight text-shadow-lg"> {/* Mejor leading y sombra */}
            <span className="text-glow-primary bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Domina
            </span>{' '} {/* Espacio añadido */}
            <span className="text-foreground">el Futuro</span>
            <br />
            <span className="text-foreground">del</span>{' '} {/* Espacio añadido */}
            <span className="text-secondary text-glow-secondary">Gaming</span>
          </h1>

          {/* Descripción */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
            Explora catálogos inmersivos, compite al más alto nivel y conecta con la comunidad gamer global. Tu próxima aventura empieza aquí.
          </p>

          {/* Botones con más estilo */}
          <div className="flex flex-wrap gap-4 pt-5 justify-center md:justify-start">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground text-glow-primary shadow-lg hover:shadow-glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 px-8" // Padding extra
            >
              <Play className="h-5 w-5" />
              Explorar Juegos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-primary/40 text-primary/90 hover:bg-primary/10 hover:border-primary/70 hover:text-primary transition-all duration-300 backdrop-blur-sm active:scale-95 px-8" // Padding extra
            >
              <ListPlus className="h-5 w-5" /> {/* Icono cambiado */}
              Mi Lista
            </Button>
          </div>

          {/* Estadísticas (opcional, con estilo mejorado) */}
          <div className="flex flex-wrap gap-6 md:gap-10 pt-10 justify-center md:justify-start text-center md:text-left">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.5}}>
              <div className="text-3xl font-bold text-primary text-glow-primary">10M+</div>
              <div className="text-sm text-muted-foreground tracking-wider">JUGADORES</div>
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.7}}>
              <div className="text-3xl font-bold text-secondary text-glow-secondary">5K+</div>
              <div className="text-sm text-muted-foreground tracking-wider">JUEGOS</div>
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.9}}>
              <div className="text-3xl font-bold text-accent text-glow-accent">24/7</div>
              <div className="text-sm text-muted-foreground tracking-wider">ACCIÓN</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;