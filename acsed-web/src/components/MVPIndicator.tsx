import type { JSX } from "react";

/**
 * Distintivo "⭐ MVP" reutilizable. Renderiza nada si `visible` es false.
 * Usado en la card de convocatoria del detalle del partido y en la carga en vivo.
 */
export function MVPIndicator(): JSX.Element | null {
  return <span className="font-bold text-energia-600"> ⭐ MVP</span>;
}
