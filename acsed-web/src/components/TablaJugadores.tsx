import { Fragment, useState, type JSX } from "react";
import type { FilaJugador } from "../api/types";
import { useOrden } from "../hooks/useOrden";
import { rendimiento, rendimientoValor } from "../utils/rendimiento";
import { SortTH } from "./SortTH";

/**
 * Tabla de jugadores responsive: en movil muestra Jugador/PJ/PG/PE/PP/Goles
 * y cada fila se expande al tap con %/Autogoles/TA/TR/Convocado/Ausencias;
 * en escritorio muestra todas las columnas.
 */
export function TablaJugadores({ filas }: { filas: FilaJugador[] }): JSX.Element {
  const orden = useOrden(filas, (f, k) => {
    switch (k) {
      case "nombre":
        return f.nombre;
      case "pj":
        return f.pj;
      case "pg":
        return f.pg;
      case "pe":
        return f.pe;
      case "pp":
        return f.pp;
      case "rend":
        return rendimientoValor(f.pg, f.pe, f.pj);
      case "goles":
        return f.goles;
      case "autogoles":
        return f.autogoles;
      case "amarillas":
        return f.amarillas;
      case "rojas":
        return f.rojas;
      case "convocados":
        return f.convocados;
      default:
        return f.ausentes;
    }
  });
  const [expandida, setExpandida] = useState<Record<string, boolean>>({});
  const extra = "hidden md:table-cell";
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-stone-500">
          <SortTH col="nombre" label="Jugador" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
          <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="rend" label="%" hint="% de rendimiento" orden={orden.orden} onOrdenar={orden.alternar} className='hidden sm:table-cell' />
          <SortTH col="goles" label="Goles" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="autogoles" label="Autogoles" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="amarillas" label="TA" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="rojas" label="TR" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="convocados" label="Convocado" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
          <SortTH col="ausentes" label="Ausencias" orden={orden.orden} onOrdenar={orden.alternar} className={extra} />
        </tr>
      </thead>
      <tbody>
        {orden.filas.map((f) => (
          <Fragment key={f.jugadorId}>
            <tr className="border-t border-stone-100">
              <td className="p-2 font-medium">
                <button
                  type="button"
                  aria-expanded={expandida[f.jugadorId] === true}
                  aria-label={`Detalle de ${f.nombre}`}
                  onClick={() => { setExpandida((prev) => ({ ...prev, [f.jugadorId]: !(prev[f.jugadorId] === true) })); }}
                  className="min-h-11 flex items-center gap-1 md:pointer-events-none text-left"
                >
                  <span aria-hidden="true" className="md:hidden text-cancha-600 font-bold">
                    {expandida[f.jugadorId] === true ? "−" : "+"}
                  </span>
                  {f.nombre}
                </button>
              </td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.pg}</td>
              <td className="p-2 text-center">{f.pe}</td>
              <td className="p-2 text-center">{f.pp}</td>
              <td className={`p-2 text-center tabular-nums hidden sm:table-cell`}>{rendimiento(f.pg, f.pe, f.pj)}</td>
              <td className="p-2 text-center font-bold">{f.goles}</td>
              <td className={`p-2 text-center ${extra}`}>{f.autogoles}</td>
              <td className={`p-2 text-center ${extra}`}>{f.amarillas}</td>
              <td className={`p-2 text-center ${extra}`}>{f.rojas}</td>
              <td className={`p-2 text-center ${extra}`}>{f.convocados}</td>
              <td className={`p-2 text-center ${extra}`}>{f.ausentes}</td>
            </tr>
            {expandida[f.jugadorId] === true ? (
              <tr className="md:hidden border-t border-stone-100">
                <td colSpan={6} className="p-2 text-sm text-stone-600">
                  <span className="inline sm:hidden">% {rendimiento(f.pg, f.pe, f.pj)} · </span>AG {f.autogoles} · TA {f.amarillas} · TR {f.rojas} · Conv {f.convocados} · Aus {f.ausentes}
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
