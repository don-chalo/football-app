import type { JSX } from "react";
import type { FilaJugador } from "../api/types";
import { useOrden } from "../hooks/useOrden";
import { rendimiento, rendimientoValor } from "../utils/rendimiento";
import { SortTH } from "./SortTH";

/** Tabla de jugadores por liga o global: misma columnas y orden en ambas vistas. */
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
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-stone-500">
          <SortTH col="nombre" label="Jugador" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
          <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="rend" label="%" hint="% de rendimiento" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="goles" label="Goles" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="autogoles" label="Autogoles" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="amarillas" label="TA" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="rojas" label="TR" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="convocados" label="Convocado" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="ausentes" label="Ausencias" orden={orden.orden} onOrdenar={orden.alternar} />
        </tr>
      </thead>
      <tbody>
        {orden.filas.map((f) => (
          <tr key={f.jugadorId} className="border-t border-stone-100">
            <td className="p-2 font-medium">{f.nombre}</td>
            <td className="p-2 text-center">{f.pj}</td>
            <td className="p-2 text-center">{f.pg}</td>
            <td className="p-2 text-center">{f.pe}</td>
            <td className="p-2 text-center">{f.pp}</td>
            <td className="p-2 text-center tabular-nums">{rendimiento(f.pg, f.pe, f.pj)}</td>
            <td className="p-2 text-center font-bold">{f.goles}</td>
            <td className="p-2 text-center">{f.autogoles}</td>
            <td className="p-2 text-center">{f.amarillas}</td>
            <td className="p-2 text-center">{f.rojas}</td>
            <td className="p-2 text-center">{f.convocados}</td>
            <td className="p-2 text-center">{f.ausentes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
