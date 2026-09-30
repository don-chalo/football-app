import { useState, type JSX } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { SessionProvider, useSession } from "./auth/Session";
import { RequireAdmin } from "./auth/guards";
import { AdminHomePage } from "./pages/AdminHomePage";
import { EstadisticasPage } from "./pages/EstadisticasPage";
import { GestionPage } from "./pages/GestionPage";
import { NotFound } from "./pages/HomePage";
import { LigaDetailPage } from "./pages/LigaDetailPage";
import { LigaManagePage } from "./pages/LigaManagePage";
import { LigasPage } from "./pages/LigasPage";
import { LoginPage } from "./pages/LoginPage";
import { PartidoFormPage } from "./pages/PartidoFormPage";
import { PartidoManagePage } from "./pages/PartidoManagePage";
import { PartidoPage } from "./pages/PartidoPage";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

function Barra(): JSX.Element {
  const { user, logout } = useSession();
  const nav = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => { setMenuAbierto(false); };
  return (
    <header className="sticky top-0 bg-black text-white px-4 min-h-14 flex items-center justify-between">
      <Link to="/" className="font-bold min-h-11 flex items-center" tool-tip="Ir a la página principal">
        ACSED WEB
      </Link>      
      <NavigationMenu.Root className="relative z-50 hidden sm:block">
        <NavigationMenu.List className="flex items-center gap-1 sticky top-0 bg-black text-white px-4 min-h-14 justify-end">
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <NavLink to="/ligas" className="min-h-11 flex items-center bg-black text-white border border-gray-700 rounded-lg px-3">
                Ligas/Copas
              </NavLink>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <NavLink to="/estadisticas" className="min-h-11 flex items-center bg-black text-white border border-gray-700 rounded-lg px-3">
                Stats
              </NavLink>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
         {user ? (
          <>
           <NavigationMenu.Item>
            <NavigationMenu.Link asChild>              
             <NavLink className="min-h-11 flex items-center bg-black text-white border border-gray-700 rounded-lg px-3" to="/admin">
               Admin
             </NavLink>
            </NavigationMenu.Link>
           </NavigationMenu.Item>
           <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <NavLink className="min-h-11 flex items-center bg-black text-white border border-gray-700 rounded-lg px-3" to="" onClick={() => {
                 logout();
                 nav("/");
              }}>
                Salir
              </NavLink>
            </NavigationMenu.Link>
           </NavigationMenu.Item>
          </>
         ) : (
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link className="min-h-11 flex items-center bg-black text-white border border-gray-700 rounded-lg px-3" to="/login">
                Ingresar
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>

         )}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <div className="relative md:hidden" onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMenuAbierto(false);
          }
        }}
      >
        <button
          type="button"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => { setMenuAbierto(!menuAbierto); }}
          className="min-h-11 min-w-11 flex items-center justify-center border border-gray-700 rounded-lg px-3"
        >
          <span aria-hidden="true">{menuAbierto ? "X" : "Menu"}</span>
        </button>

        {menuAbierto ? (
          <nav id="menu-movil" aria-label="Menú principal" className="absolute right-0 top-full z-50 mt-2 flex w-52 flex-col gap-1 rounded-xl border border-gray-700 bg-black p-2">
            <NavLink
              to="/ligas"
              onClick={cerrarMenu}
              className="min-h-11 flex items-center justify-start border border-gray-700 rounded-lg px-3"
            >
              Ligas/Copas
            </NavLink>

            <NavLink
              to="/estadisticas"
              onClick={cerrarMenu}
              className="min-h-11 flex items-center justify-start border border-gray-700 rounded-lg px-3"
            >
              Stats
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/admin"
                  onClick={cerrarMenu}
                  className="min-h-11 flex items-center justify-start border border-gray-700 rounded-lg px-3"
                >
                  Admin
                </NavLink>

                <NavLink
                  to=""
                  onClick={() => {
                    cerrarMenu();
                    logout();
                    nav("/");
                  }}
                  className="min-h-11 flex items-center justify-start border border-gray-700 rounded-lg px-3"
                >
                  Salir
                </NavLink>
              </>
            ) : (
              <Link
                to="/login"
                onClick={cerrarMenu}
                className="min-h-11 flex items-center justify-start border border-gray-700 rounded-lg px-3"
              >
                Ingresar
              </Link>
            )}
          </nav>
        ) : null}
        </div>
    </header>
  );
}

export function App(): JSX.Element {
  return (
    <SessionProvider>
      <Barra />
      <main className="max-w-2xl mx-auto p-3 pb-10">
        <Routes>
          <Route path="/" element={<LigasPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/ligas/:id" element={<LigaDetailPage />} />
          <Route path="/partidos/:id" element={<PartidoPage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/admin" element={<RequireAdmin><AdminHomePage /></RequireAdmin>} />
          <Route path="/admin/gestion" element={<RequireAdmin><GestionPage /></RequireAdmin>} />
          <Route path="/admin/ligas/:id" element={<RequireAdmin><LigaManagePage /></RequireAdmin>} />
          <Route path="/admin/partidos/nuevo" element={<RequireAdmin><PartidoFormPage /></RequireAdmin>} />
          <Route path="/admin/partidos/:id" element={<RequireAdmin><PartidoManagePage /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </SessionProvider>
  );
}
