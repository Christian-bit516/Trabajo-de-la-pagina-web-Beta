import { useState, useEffect, useRef } from "react";
import { Gamepad2, Search, User, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);

  const dropdownRef = useRef(null);
  const { cartItems } = useCart();

  // ✅ Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error || !data) {
          setNeedsSetup(true);
          setCurrentUser(user);
        } else {
          setCurrentUser(data);
        }
      }
    };
    getUser();
  }, []);

  // ✅ Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Login normal
  const handleLogin = async () => {
    if (!email || !password) return alert("Ingresa email y contraseña");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return alert("Error al iniciar sesión: " + error.message);
    const { user } = data;
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    setCurrentUser(profile);
    setIsModalOpen(false);
    setEmail("");
    setPassword("");
  };

  // ✅ Registro por correo (solo email)
  const handleEmailRegister = async () => {
    if (!email.endsWith("@gmail.com")) return alert("Solo se permiten correos de Gmail");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return alert("Error al enviar el enlace: " + error.message);
    setPendingEmail(email.trim());
    alert("Revisa tu correo Gmail y confirma el enlace para continuar.");
  };

  // ✅ Completar configuración del perfil después del email confirmado
  const handleCompleteSetup = async () => {
    if (!username || !password)
      return alert("Completa tu nombre de usuario y contraseña");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Inicia sesión primero con tu enlace de correo.");

    // Establecer contraseña
    const { error: pwError } = await supabase.auth.updateUser({
      password,
    });
    if (pwError) return alert("Error al guardar contraseña: " + pwError.message);

    // Guardar perfil
    const avatar = user.user_metadata?.avatar_url || "";
    const newUsername = username.trim();
    await supabase.from("users").upsert({
      id: user.id,
      username: newUsername,
      email: user.email,
      avatar_url: avatar,
    });
    setNeedsSetup(false);
    setCurrentUser({ id: user.id, username: newUsername, email: user.email, avatar_url: avatar });
    alert("Perfil completado correctamente ✅");
  };

  // ✅ Login con Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) alert("Error al iniciar sesión con Google: " + error.message);
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsDropdownOpen(false);
    window.location.href = "/";
  };

  // ✅ Cerrar modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setEmail("");
    setPassword("");
    setUsername("");
    setPendingEmail("");
  };

  // ✅ Avatar dinámico
  const renderAvatar = (user) => {
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt="avatar" className="w-7 h-7 rounded-full border border-gray-600" />;
    } else {
      const letter = user?.username?.charAt(0)?.toUpperCase() || "?";
      return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
          {letter}
        </div>
      );
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5 text-gray-400 hover:text-primary transition" />
            </Button>
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              GameVerse
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>

            {/* Usuario */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="default"
                size="sm"
                className="gap-2 relative"
                onClick={() => {
                  if (!currentUser) setIsModalOpen(true);
                  else setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                {currentUser ? renderAvatar(currentUser) : <User className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {currentUser ? currentUser.username : "Cuenta"}
                </span>
              </Button>

              {/* Dropdown con animación */}
              <AnimatePresence>
                {isDropdownOpen && currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl text-white p-4 z-50"
                  >
                    <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                      {renderAvatar(currentUser)}
                      <div>
                        <p className="font-semibold text-lg">{currentUser.username}</p>
                        <p className="text-sm text-gray-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-white border-white hover:bg-white hover:text-black"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal login / registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 p-6 rounded-lg w-80 shadow-lg"
          >
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 ${tab === "login" ? "border-b-2 border-primary text-white" : "text-gray-400"}`}
                onClick={() => setTab("login")}
              >
                Iniciar Sesión
              </button>
              <button
                className={`flex-1 py-2 ${tab === "register" ? "border-b-2 border-primary text-white" : "text-gray-400"}`}
                onClick={() => setTab("register")}
              >
                Registrarse
              </button>
            </div>

            {tab === "login" ? (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-700 rounded text-white bg-gray-800 placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-700 rounded text-white bg-gray-800 placeholder-gray-400"
                />
                <Button variant="default" className="w-full mb-3" onClick={handleLogin}>
                  Entrar
                </Button>
              </>
            ) : !pendingEmail ? (
              <>
                <input
                  type="email"
                  placeholder="Correo Gmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-3 p-2 border border-gray-700 rounded text-white bg-gray-800 placeholder-gray-400"
                />
                <Button variant="default" className="w-full mb-3" onClick={handleEmailRegister}>
                  Enviar enlace de confirmación
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center">
                Ya enviamos un enlace a <span className="text-primary">{pendingEmail}</span>.<br />
                Confirma tu correo para continuar.
              </p>
            )}

            <div className="border-t border-gray-700 my-3"></div>
            <p className="text-center text-gray-400 text-sm mb-2">O continúa con</p>
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 py-2 rounded-md hover:bg-gray-100 transition mb-3"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              <span className="font-medium">Continuar con Google</span>
            </button>

            {/* ✅ Botón Cancelar */}
            <Button
              variant="outline"
              className="w-full border-gray-500 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </motion.div>
        </div>
      )}

      {/* Modal para completar perfil */}
      {needsSetup && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 p-6 rounded-lg w-80 shadow-lg text-white"
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Completa tu perfil</h2>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-700 rounded bg-gray-800 placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Contraseña nueva"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 placeholder-gray-400"
            />
            <Button variant="default" className="w-full" onClick={handleCompleteSetup}>
              Guardar perfil
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;
