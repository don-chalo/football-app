import { Fragment, useState, type JSX } from "react";
import type { FilaEquipo } from "../api/types";
import type { Orden, OrdenKey } from "../hooks/useOrden";
import { SortTH } from "./SortTH";

/**
 * Tabla de posiciones responsive: en movil muestra Equipo/PJ/DIF/Pts
 * y cada fila se expande al tap con PG/PE/PP/GF/GC; en escritorio
 * muestra todas las columnas.
 */
export function TablaEquipos({ filas, orden, nombreDe }: {
  filas: FilaEquipo[];
  orden: { orden: Orden; alternar: (key: OrdenKey) => void };
  nombreDe: (f: FilaEquipo) => string;
}): JSX.Element {
  const [expandida, setExpandida] = useState<Record<string, boolean>>({});
  const extra = "hidden md:table-cell";
  return (
    <table className="w-full text-sm text-neutral-800">
      <thead>
        <tr>
          <SortTH col="nombre" label="Equipo" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
          <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="dif" label="DIF" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="gf" label="GF" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="gc" label="GC" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="pts" label="Pts" orden={orden.orden} onOrdenar={orden.alternar} />
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <Fragment key={f.equipoId}>
            <tr className="border-t border-stone-100">
              <td className="p-2 font-medium">
                <button
                  type="button"
                  aria-expanded={expandida[f.equipoId] === true}
                  aria-label={`Detalle de ${nombreDe(f)}`}
                  onClick={() => { setExpandida((prev) => ({ ...prev, [f.equipoId]: !(prev[f.equipoId] === true) })); }}
                  className="min-h-11 flex items-center gap-1 md:pointer-events-none text-left"
                >
                  <span aria-hidden="true" className="md:hidden text-cancha-600 font-bold">
                    {expandida[f.equipoId] === true ? "−" : "+"}
                  </span>
                  {nombreDe(f)}
                </button>
              </td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.dif}</td>
              <td className={`p-2 text-center ${extra}`}>{f.pg}</td>
              <td className={`p-2 text-center ${extra}`}>{f.pe}</td>
              <td className={`p-2 text-center ${extra}`}>{f.pp}</td>
              <td className={`p-2 text-center ${extra}`}>{f.gf}</td>
              <td className={`p-2 text-center ${extra}`}>{f.gc}</td>
              <td className="p-2 text-center font-bold">{f.pts}</td>
            </tr>
            {expandida[f.equipoId] === true ? (
              <tr className="md:hidden border-t border-stone-100">
                <td colSpan={4} className="p-2 text-sm text-stone-600">
                  PG {f.pg} · PE {f.pe} · PP {f.pp} · GF {f.gf} · GC {f.gc}
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
