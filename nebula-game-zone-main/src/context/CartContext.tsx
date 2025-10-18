import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  image_url?: string;
  quantity?: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  toast: (msg: string, type?: "success" | "info" | "error") => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "error";
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // load from localStorage once
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      if (Array.isArray(stored)) setCartItems(stored);
    } catch (e) {
      console.error("Error parsing cart from localStorage", e);
    }
  }, []);

  // sync to localStorage when cartItems change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const toast = (text: string, type: "success" | "info" | "error" = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const t: ToastMessage = { id, text, type };
    setToasts((s) => [...s, t]);
    // auto dismiss after 3s
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  };

  const addToCart = (item: CartItem) => {
    // avoid duplicates: increment quantity if exists
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + (item.quantity || 1) };
        toast(`${item.titulo} incrementado en el carrito`, "info");
        return copy;
      } else {
        const newItem = { ...item, quantity: item.quantity || 1 };
        toast(`✅ ${item.titulo} agregado al carrito`, "success");
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => {
      const removed = prev.filter((p) => p.id !== id);
      toast("❌ Producto eliminado del carrito", "error");
      return removed;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast("🗑️ Carrito vaciado", "info");
  };

  const getItemCount = () => cartItems.reduce((s, it) => s + (it.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getItemCount,
        toast,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
