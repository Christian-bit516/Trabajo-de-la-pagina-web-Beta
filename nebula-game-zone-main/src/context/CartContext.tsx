// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast as uiToast } from "@/components/ui/use-toast"; // Usar el hook de toast de Shadcn
// Ya no necesitamos importar iconos aquí si no los usamos directamente en el toast title

// Interfaz para un item del carrito
export interface CartItem {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  image_url?: string;
  quantity: number; // Quantity es ahora obligatorio
}

// Interfaz para el valor del contexto
interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number; // Cantidad total de artículos individuales
  getTotalPrice: () => number; // Precio total
}

// Crear el contexto
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Props para el Provider
interface CartProviderProps {
  children: ReactNode;
}

// Proveedor del Contexto del Carrito
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Efecto para cargar el carrito desde localStorage al iniciar
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
      localStorage.removeItem("cart"); // Limpiar si hay error
    }
  }, []); // Se ejecuta solo una vez al montar

  // Efecto para guardar el carrito en localStorage cada vez que cambie
   useEffect(() => {
     // Solo guardar si hay items o si existía previamente para limpiar
     if (cartItems.length > 0 || localStorage.getItem("cart") !== null) {
         localStorage.setItem("cart", JSON.stringify(cartItems));
     }
     // Si el carrito se vacía y existía la clave, eliminarla
     if (cartItems.length === 0 && localStorage.getItem("cart") !== null) {
         localStorage.removeItem("cart");
     }
   }, [cartItems]);

  /**
   * Añade un item al carrito o incrementa su cantidad. Muestra notificación.
   */
  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantityToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((prevItem) => prevItem.id === item.id);
      let updatedItems: CartItem[];
      let toastTitle = "";
      let toastDescription = "";

      if (existingItemIndex !== -1) {
        // Actualizar cantidad
        updatedItems = prevItems.map((prevItem, index) =>
          index === existingItemIndex
            ? { ...prevItem, quantity: prevItem.quantity + quantityToAdd }
            : prevItem
        );
        toastTitle = "🛒 Cantidad Actualizada"; // Usar Emojis en el título
        toastDescription = `+${quantityToAdd} "${item.titulo}" (Total: ${updatedItems[existingItemIndex].quantity})`;

        // Mostrar toast de actualización
        uiToast({
          title: toastTitle, // Pasar solo texto
          description: toastDescription,
          // Puedes añadir className aquí si quieres estilizarlo diferente
          // className: "bg-blue-100 border-blue-400 text-blue-800", // Ejemplo
        });

      } else {
        // Añadir nuevo item
        const newItem: CartItem = {
           ...item,
           quantity: quantityToAdd,
           descripcion: item.descripcion || '',
           image_url: item.image_url || '',
         };
        updatedItems = [...prevItems, newItem];
        toastTitle = "✅ ¡Item Añadido!"; // Usar Emojis en el título
        toastDescription = `"${item.titulo}" x${quantityToAdd} agregado al inventario.`;

        // Mostrar toast de éxito
         uiToast({
            title: toastTitle, // Pasar solo texto
            description: toastDescription,
            // variant: "success", // Si tienes una variante 'success' definida
          });
      }
      return updatedItems;
    });
  };

  /**
   * Elimina completamente un item del carrito. Muestra notificación.
   */
  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.id === id);
      const updatedItems = prevItems.filter((item) => item.id !== id);

      if (removedItem) {
        // Mostrar toast de eliminación (destructivo)
        uiToast({
          variant: "destructive", // Usa la variante destructiva
          title: "❌ Item Eliminado", // Usar Emojis en el título
          description: `"${removedItem.titulo}" se ha quitado de tu inventario.`,
        });
      }
      return updatedItems;
    });
  };

   /**
   * Actualiza la cantidad. Elimina si <= 0. Muestra notificación solo al eliminar.
   */
  const updateQuantity = (id: number, quantity: number) => {
    let itemRemoved: CartItem | undefined;

    setCartItems(prevItems => {
        const currentItem = prevItems.find(item => item.id === id);
        if (!currentItem) return prevItems;

        if (quantity <= 0) {
            // Marcar para eliminar y mostrar toast
            itemRemoved = currentItem;
            return prevItems.filter(item => item.id !== id);
        } else {
            // Actualizar cantidad
            return prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            );
        }
    });

    // Mostrar toast solo si se eliminó un item
    if(itemRemoved){
         uiToast({
           variant: "destructive",
           title: "❌ Item Eliminado", // Usar Emojis en el título
           description: `"${itemRemoved.titulo}" se quitó (cantidad 0).`,
         });
    }
  };


  /**
   * Vacía el carrito. Muestra notificación.
   */
  const clearCart = () => {
    if (cartItems.length > 0) {
        setCartItems([]);
        uiToast({
          title: "🗑️ Inventario Vaciado", // Usar Emojis en el título
          description: "Todos los items han sido eliminados.",
          variant: "default" // O "destructive" si lo prefieres visualmente
        });
    }
  };

  /**
   * Calcula el número total de artículos.
   */
  const getItemCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calcula el precio total.
   */
   const getTotalPrice = (): number => {
      return cartItems.reduce((total, item) => total + item.precio * item.quantity, 0);
   }

  // Valor del contexto
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

/**
 * Hook para consumir el contexto del carrito.
 */
export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};