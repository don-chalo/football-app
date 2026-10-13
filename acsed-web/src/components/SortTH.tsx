import type { JSX } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import type { Orden, OrdenKey } from "../hooks/useOrden";

/** Header clicable con indicador de dirección. */
export function SortTH({
  col,
  label,
  orden,
  onOrdenar,
  align = "center",
  className = "",
  hint,
}: {
  col: OrdenKey;
  label: string;
  orden: Orden;
  onOrdenar: (col: OrdenKey) => void;
  align?: "left" | "center";
  className?: string;
  hint?: string;
}): JSX.Element {
  const activo = orden.key === col;
  const marca = activo ? (orden.dir === "asc" ? " ▲" : " ▼") : "";
  return (
    <th className={`${align === "left" ? "text-left" : ""} p-1 ${className}`}>
      <button
        type="button"
        onClick={() => {
          onOrdenar(col);
        }}
        aria-sort={activo ? (orden.dir === "asc" ? "ascending" : "descending") : "none"}
        title={hint}
        className="min-h-11 px-2 font-medium"
      >
        {label}
        {hint ? (
          <>
            {" "}
            <InfoCircledIcon aria-hidden="true" className="inline w-3.5 h-3.5" />
            <span className="sr-only">{hint}</span>
          </>
        ) : null}
        {marca}
      </button>
    </th>
  );
}
