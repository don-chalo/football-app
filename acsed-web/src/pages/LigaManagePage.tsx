import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { services } from "../api/services";
import { Badge, Card, Empty, ErrorMsg, Loading, Title } from "../components/ui";
import { useMapaEquipos } from "../hooks/useNombres";
import { porFechaDesc } from "../hooks/orden";
import { usePolling } from "../hooks/usePolling";
import { PartidoCard } from "../components/PartidoCard";

export function LigaManagePage(): JSX.Element {
  const { id = "" } = useParams();
  const liga = usePolling(() => services.ligas.obtener(id), 15_000);
  const partidos = usePolling(() => services.partidos.porLiga(id), 5_000);
  const mapaEquipos = useMapaEquipos();
  const esCopa = liga.data?.formato === "copa";

  if (liga.loading && !liga.data) return <Loading />;
  if (liga.error && !liga.data) return <ErrorMsg error={liga.error} onRetry={liga.refresh} />;
  if (!liga.data) return <Empty texto="Liga no encontrada." />;

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">{liga.data.nombre.toUpperCase()}</h1>
        <Badge>{esCopa ? "Copa" : "Liga"}</Badge>
      </Title>
      <Link to={`/admin/partidos/nuevo?ligaId=${id}`}>
        <Card>
          <span className="font-bold text-cancha-700 min-h-11 flex items-center">+ Nuevo partido</span>
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
