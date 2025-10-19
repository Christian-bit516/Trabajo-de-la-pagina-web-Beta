/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Navbar.tsx
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Gamepad2, Search, User as UserIcon, ShoppingCart, ArrowLeft, X, Loader2 } from "lucide-react"; // Renombrado User a UserIcon, añadido Loader2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importar Input
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/useDebounce"; // Importar hook debounce
import { Sheet, SheetTrigger } from "@/components/ui/sheet"; // Importar Sheet y SheetTrigger
import { CartSidebar } from "@/components/CartSidebar"; // Importar el nuevo sidebar
import {
  Popover,
  PopoverContent,
  PopoverTrigger, // Necesitas importar PopoverTrigger
  // PopoverAnchor, // Eliminado
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area"; // Para resultados de búsqueda
import type { User as SupabaseUser } from '@supabase/supabase-js'; // Importar tipo User de Supabase

// --- Constantes ---
const DEBOUNCE_DELAY: number = 300; // ms
const SEARCH_RESULTS_LIMIT: number = 5;

// --- Tipos ---
// Combinar User de Supabase con campos de tu tabla 'users'
type UserProfile = (SupabaseUser & {
    username?: string;
    avatar_url?: string;
    // Añade otros campos si los tienes
}) | null;

interface GameSearchResult {
  id: number;
  titulo: string;
  descripcion: string;
  image_url?: string;
}

const Navbar: React.FC = () => { // Añadir tipo React.FC
  // --- Estados --- (Restaurados y combinados)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<UserProfile>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);

  // --- Hooks ---
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cartItems, getItemCount } = useCart(); // Usar getItemCount directamente
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCE_DELAY); // Tipar useDebounce

  // --- Efectos ---

  // Efecto principal para manejar estado de autenticación y perfil de usuario
  useEffect(() => {
    // Función para obtener/validar el perfil del usuario desde la tabla 'users'
    const fetchAndSetUserProfile = async (user: SupabaseUser | null) => {
      if (!user) { // Si no hay usuario autenticado
        setCurrentUser(null);
        setNeedsProfileSetup(false);
        return;
      }

      // Intentar obtener el perfil correspondiente al ID del usuario autenticado
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single(); // Espera un solo resultado

      if (error || !profile) { // Si hay error o no se encuentra perfil
        console.warn("Usuario necesita completar perfil o hubo error al buscarlo:", error?.message);
        // Marcar que necesita setup y guardar temporalmente los datos básicos del usuario de Supabase Auth
        setCurrentUser({
            ...user, // Incluye id, email, created_at, etc.
            username: user.email?.split('@')[0] || 'Usuario', // Nombre temporal basado en email
            avatar_url: user.user_metadata?.avatar_url, // Usar avatar de metadata si existe
        });
        setNeedsProfileSetup(true); // Activar modal de completar perfil
      } else {
         // Perfil encontrado, combinar datos de Supabase Auth y de la tabla 'users'
         setCurrentUser({
            ...user, // Datos base de Supabase Auth
            ...profile, // Sobrescribir/añadir datos del perfil (username, avatar_url personalizado, etc.)
            // Asegurar que avatar_url del perfil tenga precedencia
            avatar_url: profile.avatar_url || user.user_metadata?.avatar_url,
         });
        setNeedsProfileSetup(false); // Asegurarse que el modal de setup esté desactivado
      }
    };

    // Cargar perfil del usuario actual al montar el componente
    supabase.auth.getUser().then(({ data: { user } }) => {
        fetchAndSetUserProfile(user);
    });

    // Suscribirse a cambios en el estado de autenticación (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.id); // Log para depuración
      // Volver a cargar el perfil cada vez que cambie la sesión
      await fetchAndSetUserProfile(session?.user ?? null);
      // Cerrar modales y limpiar estado relacionado con auth al cambiar sesión
      setIsAuthModalOpen(false);
      setIsUserDropdownOpen(false);
      setPendingEmail(""); // Limpiar email pendiente si cambia el estado
    });

    // Limpiar la suscripción al desmontar el componente para evitar fugas de memoria
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

  // Efecto para cerrar el dropdown de usuario si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efecto para ejecutar la búsqueda de juegos cuando el valor `debouncedSearchQuery` cambie
  // y el popover de búsqueda esté intencionalmente abierto (`isSearchPopoverOpen`)
   useEffect(() => {
     const searchGames = async () => {
       if (debouncedSearchQuery.trim().length < 2 || !isSearchPopoverOpen) {
         setSearchResults([]); setIsSearching(false); return;
       }
       setIsSearching(true);
       try {
         const { data, error } = await supabase.from('games').select('id, titulo, descripcion, image_url').or(`titulo.ilike.%${debouncedSearchQuery}%,descripcion.ilike.%${debouncedSearchQuery}%`).limit(SEARCH_RESULTS_LIMIT);
         if (error) throw error;
         setSearchResults(data || []);
       } catch (error: any) {
         console.error("Error al buscar juegos:", error.message); setSearchResults([]);
       } finally {
         setIsSearching(false);
       }
     };
     if(isSearchPopoverOpen) searchGames(); else { setSearchResults([]); setIsSearching(false); }
   }, [debouncedSearchQuery, isSearchPopoverOpen]);

   // Efecto para enfocar el input de búsqueda cuando se abre
   useEffect(() => {
       if (isSearchOpen) {
           const timer = setTimeout(() => {
               searchInputRef.current?.focus();
               // Abrir popover si hay texto al abrir el input
               if (searchQuery.trim().length > 0) setIsSearchPopoverOpen(true);
           }, 50);
           return () => clearTimeout(timer);
       } else {
            // Si se cierra el input manualmente (clic en icono Search de nuevo), cerrar popover
            setIsSearchPopoverOpen(false);
       }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isSearchOpen]); // Dependencia clave: isSearchOpen


  // --- Handlers --- (Restaurados de tu versión original, con mínimas adaptaciones)

  const handleAuthAction = async (action: 'login' | 'register' | 'google') => {
    try {
      if (action === 'login') {
        if (!email || !password) throw new Error("Ingresa email y contraseña");
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setIsAuthModalOpen(false); // Cerrar en éxito
        setEmail(""); setPassword("");
      } else if (action === 'register') {
        if (!email.trim()) throw new Error("Ingresa un correo electrónico");
        // Tu versión original permitía cualquier correo, así que se mantiene
        // if (!email.endsWith("@gmail.com")) throw new Error("Solo se permiten correos de Gmail");
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin }});
        if (error) throw error;
        setPendingEmail(email.trim()); // Mostrar mensaje de espera
      } else if (action === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" }}});
        if (error) throw error; // Manejar error de inicio de redirección
      }
    } catch (error: any) {
      alert(error.message); // Mostrar error al usuario
      console.error(`Error en ${action}:`, error.message); // Log detallado
    }
  };

  const handleCompleteSetup = async () => {
    if (!username || !password) return alert("Completa tu nombre de usuario y contraseña");
    // Usar currentUser.id que viene de Supabase Auth
    if (!currentUser || !currentUser.id || !currentUser.email) {
       console.error("currentUser inválido en handleCompleteSetup:", currentUser);
       return alert("Error: No se pudo identificar al usuario.");
    }

    try {
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      const user = currentUser as SupabaseUser; // Sabemos que tiene id y email
      const { data: profileData, error: profileError } = await supabase.from("users").upsert({
        id: user.id, // ID clave
        username: username.trim(),
        email: user.email, // Guardar email en perfil
        avatar_url: user.user_metadata?.avatar_url || "", // Avatar inicial
      }, { onConflict: 'id' }).select().single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("No se pudo guardar el perfil.");

      // Actualizar estado local y cerrar modal
      setCurrentUser({ ...user, ...profileData }); // Combinar datos
      setNeedsProfileSetup(false);
      setPassword(""); setUsername("");
      alert("Perfil completado ✅");
    } catch (error: any) {
      alert(error.message);
      console.error("Error al completar perfil:", error.message);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setIsUserDropdownOpen(false); // Solo cerrar dropdown
    // Listener limpiará currentUser
  };

  const handleCancelAuth = () => {
    // Restablece todos los estados relacionados con auth/setup
    setIsAuthModalOpen(false);
    setNeedsProfileSetup(false);
    setEmail(""); setPassword(""); setUsername(""); setPendingEmail("");
    setAuthTab("login");
  };

  // Actualiza query y controla popover
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Popover se abre/cierra basado en si hay texto
    setIsSearchPopoverOpen(value.trim().length > 0);
  };

  // Limpia búsqueda y popover, mantiene foco
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPopoverOpen(false);
    searchInputRef.current?.focus();
  };

  // Cierra todo al seleccionar resultado
  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPopoverOpen(false);
    setIsSearchOpen(false); // Cerrar input animado
  };

  // Controla clic en icono/botón de usuario
  const toggleUserDropdown = () => {
    if (!currentUser) { // No logueado -> Abrir modal auth
      setIsAuthModalOpen(true);
      setNeedsProfileSetup(false); // Asegurar que no sea el de setup
    } else if (needsProfileSetup) { // Logueado pero necesita setup -> No hacer nada (modal setup ya visible)
      setIsAuthModalOpen(false); // Asegurar que modal auth esté cerrado
    } else { // Logueado y con perfil -> Alternar dropdown
      setIsUserDropdownOpen(prev => !prev);
    }
  };

  // --- Renderizado ---

  // Renderiza avatar o icono
  const renderAvatar = (user: UserProfile) => {
    // Lógica original restaurada
    if (!user) return <UserIcon className="h-5 w-5" />; // Usar icono renombrado
    const avatarUrl = user.avatar_url || user.user_metadata?.avatar_url; // Prioriza tabla users
    const displayName = user.username || user.email?.split('@')[0] || '?'; // Prioriza tabla users
    if (avatarUrl) return <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full border border-border" />;
    const letter = displayName?.charAt(0)?.toUpperCase() || "?";
    return <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs">{letter}</div>;
  };

  // Nombre a mostrar en dropdown
  const displayUsername = currentUser?.username || currentUser?.email?.split('@')[0];
  // Contador de carrito
  const totalCartItems = getItemCount();

  // JSX Principal
  return (
    <Sheet> {/* Envolver todo en Sheet para CartSidebar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo y Navegación (sin cambios) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => window.history.back()} aria-label="Volver atrás"><ArrowLeft className="h-5 w-5 text-gray-400 hover:text-primary transition" /></Button>
            <Link to="/" className="flex items-center gap-2" aria-label="Ir a la página principal">
              <Gamepad2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <span className="hidden sm:inline text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">GameVerse</span>
            </Link>
          </div>

          {/* Búsqueda y Acciones */}
          <div className="flex items-center gap-2 sm:gap-4 relative">

             {/* Popover/Input de Búsqueda (Integrado) */}
             <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                {/* El botón Search es el Trigger */}
                <PopoverTrigger asChild>
                    <Button
                      variant="ghost" size="icon"
                      className="hover:text-primary flex-shrink-0"
                      onClick={() => setIsSearchOpen(prev => !prev)} // Controla visibilidad del input
                      aria-label={isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>

                {/* Input animado (posicionado absolutamente) */}
                 <div className="absolute right-[calc(100%+8px)] sm:right-[calc(100%+16px)] top-1/2 -translate-y-1/2 h-9 pointer-events-none"> {/* Ajustar right basado en gap */}
                    <motion.div
                        initial={false}
                        animate={isSearchOpen ? { width: "150px", opacity: 1 } : { width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full overflow-hidden pointer-events-auto"
                     >
                       <Input
                         ref={searchInputRef} type="text" placeholder="Buscar..." value={searchQuery} onChange={handleSearchChange}
                         className={`h-full pr-8 bg-card border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary text-sm transition-opacity duration-300 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                         aria-label="Buscar juegos" disabled={!isSearchOpen}
                       />
                       {searchQuery && isSearchOpen && (
                         <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground z-10" onClick={clearSearch} aria-label="Limpiar búsqueda">
                           <X className="h-4 w-4" />
                         </Button>
                       )}
                     </motion.div>
                 </div>

                {/* Contenido del Popover (Resultados) */}
                <PopoverContent className="w-[300px] sm:w-[400px] p-0 mt-2 shadow-lg" align="end" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <ScrollArea className="max-h-[min(60vh,400px)]">
                    <div className="p-2">
                       {/* ... (Renderizado de resultados y estados de carga/vacío como antes) ... */}
                        {isSearching && ( <div className="flex items-center justify-center p-4 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando...</div> )}
                        {!isSearching && searchResults.length === 0 && debouncedSearchQuery.trim().length >= 2 && ( <p className="p-4 text-sm text-center text-muted-foreground">No se encontraron resultados para "{debouncedSearchQuery}".</p> )}
                        {!isSearching && searchResults.length > 0 && (
                          <div className="space-y-1">
                            {searchResults.map((game) => (
                              <Link key={game.id} to={`/game/${game.id}`} onClick={handleResultClick} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer group">
                                <img src={game.image_url || '/placeholder.svg'} alt={game.titulo} className="w-12 h-16 object-cover rounded-sm border flex-shrink-0 mt-1" />
                                <div className="overflow-hidden flex-1">
                                  <p className="text-sm font-medium truncate text-foreground group-hover:text-accent-foreground">{game.titulo}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-accent-foreground/80">{game.descripcion || 'Sin descripción'}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                         {!isSearching && debouncedSearchQuery.trim().length >= 2 && searchResults.length > 0 && searchResults.length >= SEARCH_RESULTS_LIMIT && (
                             <p className="pt-2 mt-2 border-t border-border text-xs text-center text-muted-foreground">Mostrando los primeros {SEARCH_RESULTS_LIMIT} resultados.</p>
                         )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
             </Popover>

            {/* Botón Carrito (SheetTrigger) */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-primary relative flex-shrink-0" aria-label={`Abrir carrito (${totalCartItems} items)`}>
                <ShoppingCart className="h-5 w-5" />
                {totalCartItems > 0 && ( <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold px-1">{totalCartItems > 99 ? '99+' : totalCartItems}</span> )}
              </Button>
            </SheetTrigger>

            {/* Menú Usuario */}
            <div className="relative flex-shrink-0" ref={userDropdownRef}>
               <Button variant="ghost" size="icon" className="rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" onClick={toggleUserDropdown} aria-label={currentUser && displayUsername ? `Menú de usuario: ${displayUsername}` : "Abrir menú de cuenta"}>
                  {renderAvatar(currentUser)}
               </Button>
               <AnimatePresence>
                 {isUserDropdownOpen && currentUser && !needsProfileSetup && ( // No mostrar si necesita setup
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-60 origin-top-right bg-popover border border-border rounded-lg shadow-xl text-popover-foreground p-3 z-50">
                     <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                       {renderAvatar(currentUser)}
                       <div className="overflow-hidden">
                         <p className="font-semibold text-base truncate">{displayUsername}</p>
                         <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                       </div>
                     </div>
                     <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={handleLogout}>Cerrar sesión</Button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Carrito */}
      <CartSidebar />

      {/* --- Modales de Autenticación (Restaurados y sin cambios internos) --- */}

      {/* Modal login / registro */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4 animate-fade-in">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="bg-card p-6 rounded-lg w-full max-w-sm shadow-lg text-card-foreground relative" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
             <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={handleCancelAuth} aria-label="Cerrar modal"><X className="h-5 w-5" /></Button>
             <h2 id="auth-modal-title" className="sr-only">Autenticación</h2>
             <div className="flex mb-5 border-b border-border">
               <button className={`flex-1 pb-2 text-sm font-medium transition-colors ${authTab === "login" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setAuthTab("login")}>Iniciar Sesión</button>
               <button className={`flex-1 pb-2 text-sm font-medium transition-colors ${authTab === "register" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setAuthTab("register")}>Registrarse</button>
             </div>
             <AnimatePresence mode="wait">
               {authTab === "login" ? (
                 <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.15}}>
                   <Input id="email-login" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-3 bg-background" required />
                   <Input id="password-login" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 bg-background" required/>
                   <Button variant="default" className="w-full mb-4" onClick={() => handleAuthAction('login')}>Entrar</Button>
                 </motion.div>
               ) : (
                 <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.15}}>
                  {!pendingEmail ? (
                     <>
                        <Input id="email-register" type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-3 bg-background" required/>
                        <p className="text-xs text-muted-foreground mb-3 text-center">Te enviaremos un enlace mágico para iniciar sesión.</p>
                        <Button variant="default" className="w-full mb-4" onClick={() => handleAuthAction('register')}>Enviar enlace</Button>
                     </>
                  ) : ( <p className="text-sm text-muted-foreground text-center mb-4">Enviamos un enlace a <span className="font-medium text-foreground">{pendingEmail}</span>.<br />Revisa tu correo.</p> )}
                 </motion.div>
               )}
             </AnimatePresence>
            <div className="relative my-4"> <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div> <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">O</span></div> </div>
            <Button variant="outline" onClick={() => handleAuthAction('google')} className="w-full gap-2"> <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" /> Continuar con Google </Button>
          </motion.div>
        </div>
      )}

      {/* Modal para completar perfil */}
       {needsProfileSetup && currentUser && (
         <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4 animate-fade-in">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="bg-card p-6 rounded-lg w-full max-w-sm shadow-lg text-card-foreground" role="dialog" aria-modal="true" aria-labelledby="setup-modal-title">
              <h2 id="setup-modal-title" className="text-xl font-semibold mb-5 text-center">Completa tu perfil</h2>
              <p className="text-sm text-muted-foreground mb-3 text-center">Email: <span className="font-medium text-foreground">{currentUser.email}</span></p>
              <Input id="username-setup" type="text" placeholder="Elige un nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-3 bg-background" required />
              <Input id="password-setup" type="password" placeholder="Crea una contraseña segura" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-5 bg-background" required/>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 order-2 sm:order-1" onClick={handleCancelAuth}>Cancelar</Button>
                <Button variant="default" className="flex-1 order-1 sm:order-2" onClick={handleCompleteSetup}>Guardar perfil</Button>
              </div>
            </motion.div>
         </div>
       )}
    </Sheet>
  );
};

export default Navbar;