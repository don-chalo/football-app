import { useState, type JSX } from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
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
import { SoccerBall } from "./components/icons/SoccerBall";
import { HamburgerMenuIcon, InstagramLogoIcon } from "@radix-ui/react-icons";

function Barra(): JSX.Element {
  const { user, logout } = useSession();
  const nav = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => { setMenuAbierto(false); };
  const claseNav = ({ isActive }: { isActive: boolean }): string =>
    `min-h-11 flex items-center border rounded-lg px-3 ${isActive ? "bg-energia-400 text-cancha-950 border-transparent font-bold" : "border-white/20 text-white"}`;
  const claseNavMovil = ({ isActive }: { isActive: boolean }): string =>
    `min-h-11 flex items-center justify-start border rounded-lg px-3 ${isActive ? "bg-energia-400 text-cancha-950 border-transparent font-bold" : "border-white/20 text-white"}`;
  return (
    <header className="sticky top-0 z-30 bg-cancha-950 px-4 min-h-14 flex items-center justify-between">
      <Link to="/" className="font-black tracking-wide min-h-11 flex items-center text-energia-400" tool-tip="Ir a la página principal">
        <span className="mr-2">ACSED WEB</span>
        <SoccerBall />
      </Link>      
      <nav aria-label="Navegación principal" className="hidden sm:flex items-center gap-1">
        <NavLink to="/ligas" className={claseNav}>
          Ligas/Copas
        </NavLink>
        <NavLink to="/estadisticas" className={claseNav}>
          Stats
        </NavLink>
        {user ? (
          <>
            <NavLink className={claseNav} to="/admin">
              Admin
            </NavLink>
            <NavLink className={claseNav} to="" onClick={() => {
              logout();
              nav("/");
            }}>
              Salir
            </NavLink>
          </>
        ) : (
          <Link className="min-h-11 flex items-center border border-white/20 text-white rounded-lg px-3" to="/login">
            Ingresar
          </Link>
        )}
      </nav>
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
          className="min-h-11 min-w-11 flex items-center justify-center border border-white/20 text-white rounded-lg px-3"
        >
          <span aria-hidden="true">{menuAbierto ? "X" : <HamburgerMenuIcon />}</span>
        </button>

        {menuAbierto ? (
          <nav id="menu-movil" aria-label="Menú principal" className="absolute right-0 top-full z-50 mt-2 flex w-52 flex-col gap-1 rounded-xl border border-white/20 bg-cancha-950 p-2">
            <NavLink
              to="/ligas"
              onClick={cerrarMenu}
              className={claseNavMovil}
            >
              Ligas/Copas
            </NavLink>

            <NavLink
              to="/estadisticas"
              onClick={cerrarMenu}
              className={claseNavMovil}
            >
              Stats
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/admin"
                  onClick={cerrarMenu}
                  className={claseNavMovil}
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
                  className={claseNavMovil}
                >
                  Salir
                </NavLink>
              </>
            ) : (
              <Link
                to="/login"
                onClick={cerrarMenu}
                className="min-h-11 flex items-center justify-start border border-white/20 text-white rounded-lg px-3"
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

function Footer(): JSX.Element {
  const anio = new Date().getFullYear();
  return (
    <footer className="bg-cancha-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-2 md:py-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-black tracking-wide text-energia-400">
          <span>ACSED WEB</span>
          <SoccerBall />
        </div>
        <div className="flex justify-between gap-2">
          <nav aria-label="Navegación del pie" className="flex flex-col items-start gap-2">
            <Link to="/ligas" className="flex items-center underline underline-offset-2 text-sm md:text-base">
              Ligas/Copas
            </Link>
            <Link to="/estadisticas" className="flex items-center underline underline-offset-2 text-sm md:text-base">
              Stats
            </Link>
          </nav>
          <nav aria-label="Redes sociales" className="flex flex-col items-end gap-2">
            <a
              href="https://www.instagram.com/fcacsed"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 underline underline-offset-2 text-sm md:text-base"
            >
              <InstagramLogoIcon aria-hidden="true" />
              @fcacsed
            </a>
          </nav>
        </div>
        <p className="text-sm text-white/70">Temporada {anio}</p>
      </div>
    </footer>
  );
}

export function App(): JSX.Element {
  return (
    <SessionProvider>
      <div className="min-h-dvh flex flex-col">
        <Barra />
        <main className="w-full max-w-3xl mx-auto p-3 pb-10 flex-1">
        <Routes>
          <Route path="/" element={<LigasPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/ligas/:id" element={<Navigate to="partidos" replace />} />
          <Route path="/ligas/:id/:tab" element={<LigaDetailPage />} />
          <Route path="/partidos/:id" element={<PartidoPage />} />
          <Route path="/estadisticas" element={<Navigate to="/estadisticas/equipos" replace />} />
          <Route path="/estadisticas/:tab" element={<EstadisticasPage />} />
          <Route path="/admin" element={<RequireAdmin><AdminHomePage /></RequireAdmin>} />
          <Route path="/admin/gestion" element={<RequireAdmin><GestionPage /></RequireAdmin>} />
          <Route path="/admin/ligas/:id" element={<RequireAdmin><LigaManagePage /></RequireAdmin>} />
          <Route path="/admin/partidos/nuevo" element={<RequireAdmin><PartidoFormPage /></RequireAdmin>} />
          <Route path="/admin/partidos/:id" element={<RequireAdmin><PartidoManagePage /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
