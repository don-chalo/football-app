import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { services } from "../api/services";
import type { Equipo, Jugador, PartidoDetalle } from "../api/types";
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

export interface NombresPorIds {
  /** null mientras no hay nombres cargados para el conjunto de ids vigente. */
  mapa: Map<string, string> | null;
  error: unknown;
  refresh: () => void;
}

interface EstadoNombres {
  clave: string | null;
  mapa: Map<string, string> | null;
  error: unknown;
}

/**
 * id→nombre para un conjunto de ids (POST .../buscar). Vuelve a pedir solo cuando cambia
 * el conjunto (ids ordenados y sin duplicados), no en cada render.
 */
export function useNombresPorIds<T extends { id: string; nombre: string }>(
  ids: string[],
  buscar: (ids: string[]) => Promise<T[]>,
): NombresPorIds {
  const clave = [...new Set(ids)].sort().join(",");
  const [estado, setEstado] = useState<EstadoNombres>({ clave: null, mapa: null, error: null });
  const [tick, setTick] = useState(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    let vivo = true;
    if (clave === "") {
      setEstado({ clave, mapa: new Map(), error: null });
      return;
    }
    buscarRef.current(clave.split(",")).then(
      (items) => {
        if (vivo) setEstado({ clave, mapa: new Map(items.map((x) => [x.id, x.nombre])), error: null });
      },
      (error: unknown) => {
        if (vivo) setEstado({ clave, mapa: null, error: error ?? new Error("No se pudieron cargar los nombres") });
      },
    );
    return () => {
      vivo = false;
    };
  }, [clave, tick]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const vigente = estado.clave === clave;
  return { mapa: vigente ? estado.mapa : null, error: vigente ? estado.error : null, refresh };
}

/** Ids de jugadores que aparecen en el partido: convocados, autores de eventos y MVP. */
export function idsJugadoresDePartido(d: PartidoDetalle): string[] {
  return [
    ...d.convocatorias.map((c) => c.jugadorId),
    ...d.eventos.map((e) => e.jugadorId),
    ...(d.mvpJugadorId ? [d.mvpJugadorId] : []),
  ];
}

/** Nombres de los jugadores del partido. Solo pide POST /jugadores/buscar. */
export function useNombresJugadoresPartido(detalle: PartidoDetalle | null): NombresPorIds {
  const ids = detalle ? idsJugadoresDePartido(detalle) : [];
  return useNombresPorIds(ids, (x) => services.jugadores.buscar(x));
}

/** Nombres de los dos equipos del partido. Solo pide POST /equipos/buscar. */
export function useNombresEquiposPartido(detalle: PartidoDetalle | null): NombresPorIds {
  const ids = detalle ? [detalle.localId, detalle.visitaId] : [];
  return useNombresPorIds(ids, (x) => services.equipos.buscar(x));
}
