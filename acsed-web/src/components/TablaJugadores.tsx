import { Fragment, useState, type JSX } from "react";
import type { FilaJugador } from "../api/types";
import { useOrden } from "../hooks/useOrden";
import { rendimiento, rendimientoValor } from "../utils/rendimiento";
import { SortTH } from "./SortTH";
import { Racha } from "./Racha";
import { LEYENDA_JUGADORES, LeyendaColumnas } from "./LeyendaColumnas";

/** Formatea un promedio/ratio con 1 decimal, o "–" si no aplica. */
function num(v: number | null | undefined): string {
  return typeof v === "number" ? v.toFixed(1) : "–";
}

/**
 * Tabla de jugadores responsive.
 * - xs: Jugador/PJ/PG/PE/PP/Goles. Expansion: % y resto de columnas.
 * - sm: + %. Expansion: resto de columnas.
 * - md: + MVP. Expansion: resto de columnas.
 * - lg+ (escritorio): todas las columnas.
 * La racha se muestra siempre bajo el nombre.
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
      case "promGoles":
        return f.promedioGoles ?? -1;
      case "pctGf":
        return f.pctGf ?? -1;
      case "pctGc":
        return f.pctGc ?? -1;
      case "mvp":
        return f.mvp;
      case "rachaGoles":
        return f.rachaGoles;
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
  // Visibilidad por breakpoint (ver HU-EST-01)
  const visibleDesdeSM = "hidden sm:table-cell";
  const visibleDesdeMd = "hidden md:table-cell";
  return (
    <>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-stone-500">
          <SortTH col="nombre" label="Jugador" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
          <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="rend" label="%" orden={orden.orden} onOrdenar={orden.alternar} className={visibleDesdeSM} />
          <SortTH col="goles" label="Goles" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="mvp" label="MVP" orden={orden.orden} onOrdenar={orden.alternar} className={visibleDesdeMd} />
          <SortTH col="pctGf" label="%GF" orden={orden.orden} onOrdenar={orden.alternar} className={visibleDesdeMd} />
          <SortTH col="pctGc" label="%GC" orden={orden.orden} onOrdenar={orden.alternar} className={visibleDesdeMd} />
        </tr>
      </thead>
      <tbody>
        {orden.filas.map((f) => (
          <Fragment key={f.jugadorId}>
            <tr className="border-t border-stone-300 last-of-type:border-b">
              <td className="p-2 font-medium">
                <button
                  type="button"
                  aria-expanded={expandida[f.jugadorId] === true}
                  aria-label={`Detalle de ${f.nombre}`}
                  onClick={() => { setExpandida((prev) => ({ ...prev, [f.jugadorId]: !(prev[f.jugadorId] === true) })); }}
                  className="min-h-11 flex items-center gap-1 text-left"
                >
                  <span aria-hidden="true" className="text-cancha-600 font-bold">
                    {expandida[f.jugadorId] === true ? "−" : "+"}
                  </span>
                  {f.nombre}
                </button>
                <div className="pl-0 mt-0.5">
                  <Racha racha={f.racha} />
                </div>
              </td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.pg}</td>
              <td className="p-2 text-center">{f.pe}</td>
              <td className="p-2 text-center">{f.pp}</td>
              <td className={`p-2 text-center tabular-nums ${visibleDesdeSM}`}>{rendimiento(f.pg, f.pe, f.pj)}</td>
              <td className="p-2 text-center font-bold">{f.goles}</td>
              <td className={`p-2 text-center ${visibleDesdeMd}`}>{f.mvp}</td>
              <td className={`p-2 text-center ${visibleDesdeMd}`}>{num(f.pctGf)}</td>
              <td className={`p-2 text-center ${visibleDesdeMd}`}>{num(f.pctGc)}</td>
            </tr>
            {expandida[f.jugadorId] === true ? (
              <tr>
                <td colSpan={6} className="pb-2 text-sm text-stone-600">
                  <div className="flex flex-wrap">
                    <span className="sm:hidden inline font-bold border px-1 rounded mr-1 whitespace-nowrap">% Rendimiento {rendimiento(f.pg, f.pe, f.pj)}</span>
                    <span className="md:hidden font-bold border px-1 rounded mr-1 whitespace-nowrap">MVP {f.mvp}</span>
                    <span className="md:hidden font-bold border px-1 rounded mr-1 whitespace-nowrap">%GF {num(f.pctGf)}</span>
                    <span className="md:hidden font-bold border px-1 rounded mr-1 whitespace-nowrap">%GC {num(f.pctGc)}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">Prom. goles {num(f.promedioGoles)}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">Racha goles {f.rachaGoles}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">AG {f.autogoles}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">TA {f.amarillas}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">TR {f.rojas}</span>
                    <span className="font-bold border px-1 rounded mr-1 whitespace-nowrap">Conv {f.convocados}</span>
                    <span className="font-bold border px-1 rounded whitespace-nowrap">Aus {f.ausentes}</span>
                  </div>
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
    <div className="border-b-2 border-cancha-600 my-4"></div>
    <LeyendaColumnas entradas={LEYENDA_JUGADORES} />
    </>
  );
}
