import { useMemo, useState } from "react";

export type Direccion = "asc" | "desc";
export type OrdenKey = string;

export interface Orden {
  key: OrdenKey | null;
  dir: Direccion;
}

/**
 * Orden clicable con ciclo default -> ASC -> DESC -> default.
 * Sin key (default) devuelve las filas en el orden del API.
 */
export function useOrden<T>(
  filas: T[],
  valor: (f: T, key: OrdenKey) => string | number,
): { filas: T[]; orden: Orden; alternar: (key: OrdenKey) => void } {
  const [orden, setOrden] = useState<Orden>({ key: null, dir: "desc" });

  function alternar(key: OrdenKey): void {
    setOrden((prev) => {
      if (prev.key !== key) return { key, dir: "desc" };
      if (prev.dir === "desc") return { key, dir: "asc" };
      return { key: null, dir: "desc" };
    });
  }

  const ordenadas = useMemo(() => {
    if (orden.key === null) return filas;
    const key = orden.key;
    const dir = orden.dir === "asc" ? 1 : -1;
    return [...filas].sort((a, b) => {
      const va = valor(a, key);
      const vb = valor(b, key);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "es") * dir;
    });
  }, [filas, orden, valor]);

  return { filas: ordenadas, orden, alternar };
}
