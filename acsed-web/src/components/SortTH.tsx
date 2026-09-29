import type { JSX } from "react";
import type { Orden, OrdenKey } from "../hooks/useOrden";

/** Header clicable con indicador de dirección. */
export function SortTH({
  col,
  label,
  orden,
  onOrdenar,
  align = "center",
}: {
  col: OrdenKey;
  label: string;
  orden: Orden;
  onOrdenar: (col: OrdenKey) => void;
  align?: "left" | "center";
}): JSX.Element {
  const activo = orden.key === col;
  const marca = activo ? (orden.dir === "asc" ? " ▲" : " ▼") : "";
  return (
    <th className={`${align === "left" ? "text-left" : ""} p-1`}>
      <button
        type="button"
        onClick={() => {
          onOrdenar(col);
        }}
        aria-sort={activo ? (orden.dir === "asc" ? "ascending" : "descending") : "none"}
        className="min-h-[44px] px-2 font-medium text-stone-500"
      >
        {label}
        {marca}
      </button>
    </th>
  );
}
