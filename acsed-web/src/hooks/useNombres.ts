import { useMemo } from "react";
import { api } from "../api/client";
import type { Equipo, Jugador } from "../api/types";
import { usePolling } from "../hooks/usePolling";

/** Mapas id→nombre de catálogos (listas chicas barriales). */
export function useNombres() {
  const equipos = usePolling(() => api.get<Equipo[]>("/equipos"), 60_000);
  const jugadores = usePolling(() => api.get<Jugador[]>("/jugadores"), 60_000);
  const mapaEquipos = useMemo(() => new Map((equipos.data ?? []).map((e) => [e.id, e.nombre])), [equipos.data]);
  const mapaJugadores = useMemo(() => new Map((jugadores.data ?? []).map((j) => [j.id, j.nombre])), [jugadores.data]);
  return { mapaEquipos, mapaJugadores };
}
