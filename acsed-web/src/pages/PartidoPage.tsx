import type { JSX } from "react";
import { useParams } from "react-router-dom";
import * as _ from "lodash";
import { api } from "../api/client";
import type { PartidoDetalle } from "../api/types";
import { ActorLine, Badge, Card, Empty, ErrorMsg, Loading, Title } from "../components/ui";
import { useMapaEquipos, useMapaJugadores } from "../hooks/useNombres";
import { usePolling } from "../hooks/usePolling";

const TIPO_TXT: Record<string, string> = { gol: "Gol", autogol: "Autogol", penal: "Penal" };

export function PartidoPage(): JSX.Element {
  const { id = "" } = useParams();
  const { data, error, loading, refresh } = usePolling(() => api.get<PartidoDetalle>(`/partidos/${id}`), 12_000);
  const mapaEquipos = useMapaEquipos();
  const mapaJugadores = useMapaJugadores();
  const goleadores = _.orderBy(
    _.map(
      _.reduce(
        data?.eventos.filter((e) => e.tipo === "gol" || e.tipo === "penal") || [],
        (result: Record<string, number>, value: { jugadorId: string }) => {
          result[value.jugadorId] = (result[value.jugadorId] || 0) + 1;
          return result;
        },
        {}
      ),
      (value, key) => ({ nombre: key, goles: value })
    ),
    ["goles", "nombre"],
    ["desc", "asc"]
  );

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data) return <Empty texto="Partido no encontrado." />;

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-lg font-bold text-neutral-800">
          {(mapaEquipos.get(data.localId) ?? "?").toUpperCase()} {data.marcador.local} - {data.marcador.visita}{" "} {(mapaEquipos.get(data.visitaId) ?? "?").toUpperCase()}
        </h1>
        <Badge>{data.estado}</Badge>
      </Title>
      <div>
        {data.penalesLocal !== null && data.penalesVisita !== null ? (
          <p className="text-sm text-neutral-800">
            Penales: {data.penalesLocal}-{data.penalesVisita}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm text-neutral-800">
          <span>
            {(data.fase && " · ") || ""}
          </span>
          <span className="font-bold">Fecha de juego:&nbsp;</span>
          <span>
            {new Date(data.fecha).toLocaleString("es")}
          </span>
        </p>
      </div>
        {/* <ActorLine createdBy={data.createdBy} createdAt={data.createdAt} /> */}
      <Card className="text-neutral-800">
        <h2 className="font-bold mb-2">Goleadores</h2>
        {goleadores.length === 0 ? (
          <Empty texto="Sin goles." />
        ) : (
          <ol className="flex flex-col gap-2 list-decimal">
            {goleadores.map((goleador) => (
              <li key={goleador.nombre} className="flex justify-between gap-2">
                {' '}
                {mapaJugadores.get(goleador.nombre)}
                <span className="font-medium">{goleador.goles} gol(es)</span>                
              </li>
            ))}
          </ol>
        )}
      </Card>
      <Card className="text-neutral-800">
        <h2 className="font-bold mb-2">Cronología</h2>
        {data.eventos.length === 0 ? (
          <Empty texto="Sin goles." />
        ) : (
          <ul className="flex flex-col gap-2">
            {data.eventos.map((e) => (
              <li key={e.id} className="border-t border-neutral-200 pt-2">
                <span className="font-medium">{mapaJugadores.get(e.jugadorId) ?? "?"}</span>{" "}
                <Badge>
                  {TIPO_TXT[e.tipo] ?? e.tipo}
                  {e.minuto !== null ? ` ${String(e.minuto)}'` : ""}
                </Badge>{" "}
                <span className="text-sm text-stone-500">({mapaEquipos.get(e.equipoId)})</span>
                <br />
                <ActorLine createdBy={e.createdBy} createdAt={e.createdAt} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
