import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import GameDetail from "@/pages/GameDetail";
import Cart from "@/pages/Cart";
import ScrollToTopButton from "@/components/ScrollToTopButton";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <ScrollToTopButton /> {/* <-- Añadir el botón aquí */}
    </Router>
  );
}

export default App;
