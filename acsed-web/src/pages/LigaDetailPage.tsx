import { useState, type JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { services } from "../api/services";
import type { FilaEquipo } from "../api/types";
import type { PartidoListado } from "../api/partidos";
import { Badge, Card, Empty, ErrorMsg, Loading, Title } from "../components/ui";
import { SortTH } from "../components/SortTH";
import { useMapaEquipos } from "../hooks/useNombres";
import { porFechaDesc } from "../hooks/orden";
import { useOrden } from "../hooks/useOrden";
import { usePolling } from "../hooks/usePolling";
import { PartidoCard } from "../components/PartidoCard";
import * as Tabs from "@radix-ui/react-tabs";
import { Tab } from "../components/Tab";

type Tab = "partidos" | "tabla" | "jugadores";

export function LigaDetailPage(): JSX.Element {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<Tab>("partidos");
  const liga = usePolling(() => services.ligas.obtener(id), 15_000);
  const mapaEquipos = useMapaEquipos();

  if (liga.loading && !liga.data) return <Loading />;
  if (liga.error && !liga.data) return <ErrorMsg error={liga.error} onRetry={liga.refresh} />;
  if (!liga.data) return <Empty texto="Liga no encontrada." />;
  const l = liga.data;
  const esCopa = l.formato === "copa";

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold mr-2">{l.nombre.toUpperCase()}</h1>
        <Badge>{esCopa ? "Copa" : "Liga"}</Badge>
      </Title>
      <Tabs.Tabs defaultValue="partidos" onValueChange={(v) => { setTab(v as Tab); }}>
        <Tabs.List className="w-full flex justify-around mb-2">
          <Tab value="partidos" label="Partidos" selected={tab === "partidos"} />
          <Tab value="tabla" label={esCopa ? "Llaves" : "Tabla"} selected={tab === "tabla"} />
          <Tab value="jugadores" label="Jugadores" selected={tab === "jugadores"} />
        </Tabs.List>
        <Tabs.Content value="partidos">
          <PartidosTab ligaId={id} />
        </Tabs.Content>
        <Tabs.Content value="tabla">
         {esCopa ? <LlavesTab ligaId={id} nombres={mapaEquipos} /> : <TablaTab ligaId={id} nombres={mapaEquipos} />}
        </Tabs.Content>
        <Tabs.Content value="jugadores">
          <JugadoresTab ligaId={id} />
        </Tabs.Content>
      </Tabs.Tabs>
    </div>
  );
}

function PartidosTab({ ligaId }: { ligaId: string }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(() => services.partidos.porLiga(ligaId), 15_000);
  const mapaEquipos = useMapaEquipos();
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin partidos." />;
  return (
    <div className="flex flex-col gap-2">
      {porFechaDesc(data).map((p) => (
        <Link key={p.id} to={`/partidos/${p.id}`}>
          <PartidoCard {...p} mapaEquipos={mapaEquipos} />
        </Link>
      ))}
    </div>
  );
}

function TablaTab({ ligaId, nombres }: { ligaId: string; nombres: Map<string, string> }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(
    () => services.estadisticas.porLigaEquipos(ligaId),
    15_000,
  );
  const nombreDe = (f: FilaEquipo): string => f.nombre || nombres.get(f.equipoId) || "";
  const orden = useOrden(data ?? [], (f, k) => {
    switch (k) {
      case "nombre":
        return nombreDe(f);
      case "pj":
        return f.pj;
      case "pg":
        return f.pg;
      case "pe":
        return f.pe;
      case "pp":
        return f.pp;
      case "gf":
        return f.gf;
      case "gc":
        return f.gc;
      default:
        return f.pts;
    }
  });
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin datos." />;
  return (
    <Card className="overflow-x-auto p-2">
      <table className="w-full text-sm text-neutral-800">
        <thead>
          <tr>
            <SortTH col="nombre" label="Equipo" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
            <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="gf" label="GF" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="gc" label="GC" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pts" label="Pts" orden={orden.orden} onOrdenar={orden.alternar} />
          </tr>
        </thead>
        <tbody>
          {orden.filas.map((f) => (
            <tr key={f.equipoId} className="border-t border-stone-100">
              <td className="p-2 font-medium">{f.nombre || nombres.get(f.equipoId)}</td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.pg}</td>
              <td className="p-2 text-center">{f.pe}</td>
              <td className="p-2 text-center">{f.pp}</td>
              <td className="p-2 text-center">{f.gf}</td>
              <td className="p-2 text-center">{f.gc}</td>
              <td className="p-2 text-center font-bold">{f.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function LlavesTab({ ligaId, nombres }: { ligaId: string; nombres: Map<string, string> }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(() => services.partidos.porLiga(ligaId), 15_000);
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin partidos." />;
  const porFase = new Map<string, PartidoListado[]>();
  for (const p of porFechaDesc(data)) {
    const f = p.fase || "—";
    porFase.set(f, [...(porFase.get(f) ?? []), p]);
  }
  return (
    <div className="flex flex-col gap-3">
      {[...porFase.entries()].map(([fase, ps]) => (
        <Card key={fase}>
          <h2 className="font-bold mb-2">{fase}</h2>
          {ps.map((p) => (
              <Link key={p.id} to={`/partidos/${p.id}`} className="block py-2 border-t border-stone-100 min-h-11">
                {`${nombres.get(p.localId) ?? "?"} ${String(p.marcador.local)} - ${String(p.marcador.visita)} ${nombres.get(p.visitaId) ?? "?"}`}
              {p.penalesLocal !== null && p.penalesVisita !== null ? (
                <span className="text-sm text-stone-500"> (pen. {p.penalesLocal}-{p.penalesVisita})</span>
              ) : null}
              {p.clasificadoId ? <span className="text-sm text-cancha-700 font-medium"> → {nombres.get(p.clasificadoId)}</span> : null}
            </Link>
          ))}
        </Card>
      ))}
    </div>
  );
}

function JugadoresTab({ ligaId }: { ligaId: string }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(
    () => services.estadisticas.porLigaJugadores(ligaId),
    15_000,
  );
  const orden = useOrden(data ?? [], (f, k) => {
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
      case "goles":
        return f.goles;
      case "autogoles":
        return f.autogoles;
      case "convocados":
        return f.convocados;
      default:
        return f.ausentes;
    }
  });
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin datos." />;
  return (
    <Card className="overflow-x-auto p-2">
      <table className="w-full text-sm text-neutral-800">
        <thead>
          <tr>
            <SortTH col="nombre" label="Jugador" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
            <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="goles" label="Goles" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="autogoles" label="Autogoles" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="convocados" label="Convocado" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="ausentes" label="Ausencias" orden={orden.orden} onOrdenar={orden.alternar} />
          </tr>
        </thead>
        <tbody>
          {orden.filas.map((f) => (
            <tr key={f.jugadorId} className="border-t border-neutral-300">
              <td className="p-2 text-left">{f.nombre}</td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.pg}</td>
              <td className="p-2 text-center">{f.pe}</td>
              <td className="p-2 text-center">{f.pp}</td>
              <td className="p-2 text-center font-bold">{f.goles}</td>
              <td className="p-2 text-center">{f.autogoles}</td>
              <td className="p-2 text-center">{f.convocados}</td>
              <td className="p-2 text-center">{f.ausentes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
