import { createContext, useCallback, useContext, useMemo, useState, type JSX, type ReactNode } from "react";
import { getToken, setToken as guardarToken } from "../api/client";
import { services } from "../api/services";
import type { PublicUser } from "../api/types";

interface Session {
  user: PublicUser | null;
  misLigas: string[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  agregarLiga: (id: string) => void;
  quitarLiga: (id: string) => void;
  esSistema: boolean;
}

const Ctx = createContext<Session | null>(null);

const MIS_LIGAS_KEY = "acsed.misLigas";
const USER_KEY = "acsed.user";

function leerJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<PublicUser | null>(() => (getToken() ? (leerJSON(USER_KEY) as PublicUser | null) : null));
  const [misLigas, setMisLigas] = useState<string[]>(() => (leerJSON(MIS_LIGAS_KEY) as string[] | null) ?? []);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const r = await services.auth.login({ username, password });
    guardarToken(r.token);
    setUser(r.user);
    setMisLigas(r.misLigas);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(r.user));
      localStorage.setItem(MIS_LIGAS_KEY, JSON.stringify(r.misLigas));
    } catch {
      /* sin persistencia */
    }
  }, []);

  const logout = useCallback(() => {
    guardarToken(null);
    setUser(null);
    setMisLigas([]);
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(MIS_LIGAS_KEY);
    } catch {
      /* sin persistencia */
    }
  }, []);

  const persistirLigas = useCallback((siguiente: (prev: string[]) => string[]): void => {
    setMisLigas((prev) => {
      const next = siguiente(prev);
      if (next !== prev) {
        try {
          localStorage.setItem(MIS_LIGAS_KEY, JSON.stringify(next));
        } catch {
          /* sin persistencia */
        }
      }
      return next;
    });
  }, []);

  const agregarLiga = useCallback((id: string): void => {
    persistirLigas((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [persistirLigas]);

  const quitarLiga = useCallback((id: string): void => {
    persistirLigas((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : prev));
  }, [persistirLigas]);

  const value = useMemo<Session>(
    () => ({ user, misLigas, login, logout, agregarLiga, quitarLiga, esSistema: user?.role === "admin_usuarios" }),
    [user, misLigas, login, logout, agregarLiga, quitarLiga],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession fuera de SessionProvider");
  return s;
}
