import type { JSX } from "react";

export interface EntradaLeyenda {
  sigla: string;
  nombre: string;
  descripcion: string;
  formula?: string;
}

/** Card con la definicion de cada columna de una tabla de estadisticas. Estatica. */
export function LeyendaColumnas({ entradas }: { entradas: EntradaLeyenda[] }): JSX.Element {
  return (
    <div className="mt-3 text-sm">
      <h3 className="font-bold mb-2">Leyenda</h3>
      <dl className="flex flex-col gap-2">
        {entradas.map((e) => (
          <div key={e.sigla} className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="font-bold text-cancha-900 sm:w-28 shrink-0">
              {e.sigla}
            </dt>
            <dd className="text-stone-600">
              <span className="font-normal">{e.nombre}. </span>{e.descripcion}
              {e.formula ? <span className="block sm:inline sm:ml-2 font-mono">{e.formula}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export const LEYENDA_EQUIPOS: EntradaLeyenda[] = [
  { sigla: "PJ", nombre: "Partidos jugados", descripcion: "Partidos finalizados del equipo." },
  { sigla: "PG / PE / PP", nombre: "Ganados / Empatados / Perdidos", descripcion: "Partidos ganados, empatados y perdidos." },
  { sigla: "GF", nombre: "Goles a favor", descripcion: "Goles anotados por el equipo." },
  { sigla: "GC", nombre: "Goles en contra", descripcion: "Goles recibidos por el equipo." },
  { sigla: "DIF", nombre: "Diferencia de goles", descripcion: "Diferencia entre goles a favor y en contra.", formula: "GF − GC" },
  { sigla: "%", nombre: "Rendimiento", descripcion: "Porcentaje de puntos obtenidos sobre los posibles.", formula: "(3·PG + PE) / (3·PJ) × 100" },
  { sigla: "%GF", nombre: "Promedio de goles a favor", descripcion: "Goles a favor por partido.", formula: "GF / PJ" },
  { sigla: "%GC", nombre: "Promedio de goles en contra", descripcion: "Goles en contra por partido.", formula: "GC / PJ" },
  { sigla: "Pts", nombre: "Puntos", descripcion: "Puntos del equipo.", formula: "3·PG + PE" },
];

export const LEYENDA_JUGADORES: EntradaLeyenda[] = [
  { sigla: "PJ", nombre: "Partidos jugados", descripcion: "Partidos finalizados en que estuvo convocado y no ausente." },
  { sigla: "PG / PE / PP", nombre: "Ganados / Empatados / Perdidos", descripcion: "Resultado del equipo por el que jugó en esos partidos." },
  { sigla: "%", nombre: "Rendimiento", descripcion: "Porcentaje de puntos obtenidos sobre los posibles.", formula: "(3·PG + PE) / (3·PJ) × 100" },
  { sigla: "Goles", nombre: "Goles", descripcion: "Goles anotados (gol y penal)." },
  { sigla: "MVP", nombre: "Partidos como MVP", descripcion: "Cantidad de partidos en que fue elegido MVP." },
  { sigla: "Prom. goles", nombre: "Promedio de goles por partido", descripcion: "Goles por partido jugado.", formula: "Goles / PJ" },
  { sigla: "%GF", nombre: "Promedio de goles a favor", descripcion: "Goles a favor de su equipo por partido jugado.", formula: "GF del equipo / PJ" },
  { sigla: "%GC", nombre: "Promedio de goles en contra", descripcion: "Goles en contra de su equipo por partido jugado.", formula: "GC del equipo / PJ" },
  { sigla: "Racha goles", nombre: "Partidos consecutivos anotando", descripcion: "Partidos seguidos con al menos 1 gol, desde el más reciente. Los autogoles no cuentan." },
  { sigla: "AG", nombre: "Autogoles", descripcion: "Autogoles del jugador." },
  { sigla: "TA / TR", nombre: "Tarjetas amarillas / rojas", descripcion: "Tarjetas recibidas." },
  { sigla: "Conv", nombre: "Convocado", descripcion: "Partidos en que fue convocado." },
  { sigla: "Aus", nombre: "Ausencias", descripcion: "Convocatorias marcadas como ausente." },
];
