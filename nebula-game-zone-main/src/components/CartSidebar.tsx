// src/components/CartSidebar.tsx
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export function CartSidebar() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getItemCount, getTotalPrice } = useCart();
  const totalItems = getItemCount();
  const totalPrice = getTotalPrice();

  return (
    <SheetContent className="flex flex-col p-0">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="flex items-center gap-2">
           <ShoppingCart className="h-5 w-5" /> Tu Carrito ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </SheetTitle>
      </SheetHeader>

      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tu carrito está vacío.</p>
          <SheetClose asChild>
             <Button variant="link" className="mt-2 text-primary">Seguir comprando</Button>
          </SheetClose>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-start border-b pb-4 last:border-b-0">
                  <img
                    src={item.image_url || '/placeholder.svg'} // Usar placeholder si no hay imagen
                    alt={item.titulo}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <Link to={`/game/${item.id}`} className="font-semibold hover:underline line-clamp-1">
                      {item.titulo}
                    </Link>
                    <p className="text-sm text-primary font-medium">${item.precio.toFixed(2)}</p>
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                       <Button
                         variant="outline" size="icon" className="h-6 w-6"
                         onClick={() => updateQuantity(item.id, item.quantity - 1)}
                       > <Minus className="h-3 w-3" /> </Button>
                       <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                       <Button
                         variant="outline" size="icon" className="h-6 w-6"
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                       > <Plus className="h-3 w-3" /> </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Eliminar ${item.titulo}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-card flex-col gap-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Subtotal:</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
             <div className="flex gap-3">
                 <Button variant="outline" className="flex-1" onClick={clearCart}>
                    <Trash2 className="h-4 w-4 mr-2"/> Vaciar Carrito
                 </Button>
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
                   Proceder al Pago
                </Button>
            </div>
             <SheetClose asChild>
                <Button variant="link" className="text-sm text-muted-foreground">Continuar Comprando</Button>
             </SheetClose>
          </SheetFooter>
        </>
      )}
    </SheetContent>
  );
}