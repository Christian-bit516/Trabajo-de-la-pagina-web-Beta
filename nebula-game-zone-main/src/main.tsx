// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext"; // ← ruta relativa
import { Toaster } from "@/components/ui/toaster"; // Importar Toaster

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
      <Toaster /> {/* Añadir Toaster para mostrar alertas */}
    </CartProvider>
  </React.StrictMode>
);