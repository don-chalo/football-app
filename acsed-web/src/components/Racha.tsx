import type { JSX } from "react";
import type { LetraResultado } from "../api/types";

const COLOR: Record<LetraResultado, string> = {
  G: "bg-green-600 text-white",
  E: "bg-stone-400 text-white",
  P: "bg-red-600 text-white",
};

const NOMBRE: Record<LetraResultado, string> = {
  G: "Ganado",
  E: "Empatado",
  P: "Perdido",
};

/** Racha de ultimos resultados como badges G/E/P. Sin partidos no renderiza nada. */
export function Racha({ racha }: { racha: LetraResultado[] | undefined }): JSX.Element {
  if (!racha || racha.length === 0) return <></>;
  return (
    <span className="inline-flex gap-0.5" aria-label={`Racha: ${racha.map((r) => NOMBRE[r]).join(", ")}`}>
      {racha.map((r, i) => (
        <span
          key={`${String(i)}-${r}`}
          className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${COLOR[r]}`}
        >
          {r}
        </span>
      ))}
    </span>
  );
}
