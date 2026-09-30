import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Liga } from "../api/types";
import { Card, Empty, ErrorMsg, Loading } from "../components/ui";
import { useMapaEquipos } from "../hooks/useNombres";
import { porFechaDesc } from "../hooks/orden";
import { usePolling } from "../hooks/usePolling";
import { PartidoCard } from "../components/PartidoCard";

interface PartidoRow {
  id: string;
  localId: string;
  visitaId: string;
  fecha: string;
  estado: string;
  fase: string;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
  marcador: { local: number; visita: number };
}

export function LigaManagePage(): JSX.Element {
  const { id = "" } = useParams();
  const liga = usePolling(() => api.get<Liga>(`/ligas/${id}`), 15_000);
  const partidos = usePolling(() => api.get<PartidoRow[]>(`/partidos?ligaId=${id}`), 5_000);
  const mapaEquipos = useMapaEquipos();

  if (liga.loading && !liga.data) return <Loading />;
  if (liga.error && !liga.data) return <ErrorMsg error={liga.error} onRetry={liga.refresh} />;
  if (!liga.data) return <Empty texto="Liga no encontrada." />;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">{liga.data.nombre.toUpperCase()}</h1>
      <Link to={`/admin/partidos/nuevo?ligaId=${id}`}>
        <Card>
          <span className="font-bold text-emerald-800 min-h-11 flex items-center">+ Nuevo partido</span>
        </Card>
      </Link>
      {partidos.data ? (
        porFechaDesc(partidos.data).map((p) => (
          <Link key={p.id} to={`/admin/partidos/${p.id}`}>
            <PartidoCard {...p} mapaEquipos={mapaEquipos} />
          </Link>
        ))
      ) : null}
    </div>
  );
}
