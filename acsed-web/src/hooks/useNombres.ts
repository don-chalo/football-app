import { useMemo } from "react";
import { services } from "../api/services";
import type { Equipo, Jugador } from "../api/types";
import { usePolling } from "../hooks/usePolling";

/** Base privada: id→nombre de un catálogo (listas chicas barriales). */
function useCatalogo<T extends { id: string; nombre: string }>(fetcher: () => Promise<T[]>): Map<string, string> {
  const estado = usePolling(fetcher, 60_000);
  return useMemo(() => new Map((estado.data ?? []).map((item) => [item.id, item.nombre])), [estado.data]);
}

/** Mapa id→nombre de equipos. Solo pide GET /equipos. */
export function useMapaEquipos(): Map<string, string> {
  return useCatalogo<Equipo>(() => services.equipos.listar());
}

/** Mapa id→nombre de jugadores. Solo pide GET /jugadores. */
export function useMapaJugadores(): Map<string, string> {
  return useCatalogo<Jugador>(() => services.jugadores.listar());
}
