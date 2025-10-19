// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast as uiToast } from "@/components/ui/use-toast";

export interface CartItem {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  image_url?: string;
  quantity: number; // Quantity es ahora obligatorio
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number; // Total de artículos individuales
  getTotalPrice: () => number; // Precio total
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        const validatedCart = parsedCart.map(item => ({
          ...item,
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        }));
        setCartItems(validatedCart);
      }
    } catch (error) {
      console.error("Error al cargar el carrito desde localStorage:", error);
      localStorage.removeItem("cart");
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantityToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((prevItem) => prevItem.id === item.id);
      let updatedItems: CartItem[];
      if (existingItemIndex !== -1) {
        updatedItems = prevItems.map((prevItem, index) =>
          index === existingItemIndex
            ? { ...prevItem, quantity: prevItem.quantity + quantityToAdd }
            : prevItem
        );
        uiToast({ title: "🛒 Cantidad actualizada", description: `+${quantityToAdd} ${item.titulo} en tu carrito.` });
      } else {
         const newItem: CartItem = {
           ...item,
           quantity: quantityToAdd,
           descripcion: item.descripcion || '',
           image_url: item.image_url || '',
         };
        updatedItems = [...prevItems, newItem];
        uiToast({ title: "✅ Juego agregado", description: `${item.titulo} (${quantityToAdd}) añadido.` });
      }
      return updatedItems;
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.id === id);
      const updatedItems = prevItems.filter((item) => item.id !== id);
      if (removedItem) {
        uiToast({ title: "❌ Juego eliminado", description: `${removedItem.titulo} quitado.`, variant: "destructive" });
      }
      return updatedItems;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prevItems => {
        const currentItem = prevItems.find(item => item.id === id);
        if (!currentItem) return prevItems; // No hacer nada si el item no existe

        if (quantity <= 0) {
            // Eliminar si la cantidad es 0 o menos
             if (currentItem) { // Toast solo si realmente se elimina
                 uiToast({ title: "❌ Juego eliminado", description: `${currentItem.titulo} quitado por cantidad 0.`, variant: "destructive"});
             }
            return prevItems.filter(item => item.id !== id);
        } else {
            // Actualizar cantidad
            return prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            );
        }
    });
  };

  const clearCart = () => {
    setCartItems([]);
    uiToast({ title: "🗑️ Carrito vaciado", description: "Todos los juegos eliminados.", variant: "default" });
  };

  const getItemCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

   const getTotalPrice = (): number => {
      return cartItems.reduce((total, item) => total + item.precio * item.quantity, 0);
   };

  const contextValue: CartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};