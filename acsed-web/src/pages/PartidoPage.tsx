import type { JSX } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { PartidoDetalle } from "../api/types";
import { ActorLine, Badge, Card, Empty, ErrorMsg, Loading } from "../components/ui";
import { useNombres } from "../hooks/useNombres";
import { usePolling } from "../hooks/usePolling";

const TIPO_TXT: Record<string, string> = { gol: "Gol", autogol: "Autogol", penal: "Penal" };

export function PartidoPage(): JSX.Element {
  const { id = "" } = useParams();
  const { data, error, loading, refresh } = usePolling(() => api.get<PartidoDetalle>(`/partidos/${id}`), 12_000);
  const { mapaEquipos, mapaJugadores } = useNombres();

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data) return <Empty texto="Partido no encontrado." />;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            {mapaEquipos.get(data.localId) ?? "?"} {data.marcador.local} - {data.marcador.visita}{" "}
            {mapaEquipos.get(data.visitaId) ?? "?"}
          </h1>
          <Badge>{data.estado}</Badge>
        </div>
        <p className="text-sm text-stone-500">
          {(data.fase && " · ") || ""}{"Fecha de juego: " + new Date(data.fecha).toLocaleString("es")}
        </p>
        {data.penalesLocal !== null && data.penalesVisita !== null ? (
          <p className="text-sm">
            Penales: {data.penalesLocal}-{data.penalesVisita}
          </p>
        ) : null}
        <ActorLine createdBy={data.createdBy} createdAt={data.createdAt} />
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Goles</h2>
        {data.eventos.length === 0 ? (
          <Empty texto="Sin goles." />
        ) : (
          <ul className="flex flex-col gap-2">
            {data.eventos.map((e) => (
              <li key={e.id} className="border-t border-stone-100 pt-2">
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
