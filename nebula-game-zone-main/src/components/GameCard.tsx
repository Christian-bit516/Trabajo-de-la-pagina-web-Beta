import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";

interface GameCardProps {
  title: string;
  image: string;
  price: string;
  rating: number;
  genre: string;
}

const GameCard = ({ title, image, price, rating, genre }: GameCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="lg"
            className="gap-2 bg-primary/90 backdrop-blur-sm hover:bg-primary"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar Ahora
          </Button>
        </div>

        {/* Genre Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
          {genre}
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">/5</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl font-bold text-primary">{price}</span>
          <span className="text-xs text-muted-foreground line-through">$59.99</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
