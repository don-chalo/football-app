import { useState, type JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { FilaEquipo, FilaJugador, Liga } from "../api/types";
import { Badge, Card, Empty, ErrorMsg, Loading } from "../components/ui";
import { SortTH } from "../components/SortTH";
import { useNombres } from "../hooks/useNombres";
import { porFechaDesc } from "../hooks/orden";
import { useOrden } from "../hooks/useOrden";
import { usePolling } from "../hooks/usePolling";

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
}

type Tab = "partidos" | "tabla" | "jugadores";

export function LigaDetailPage(): JSX.Element {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<Tab>("partidos");
  const liga = usePolling(() => api.get<Liga>(`/ligas/${id}`), 15_000);
  const { mapaEquipos } = useNombres();

  if (liga.loading && !liga.data) return <Loading />;
  if (liga.error && !liga.data) return <ErrorMsg error={liga.error} onRetry={liga.refresh} />;
  if (!liga.data) return <Empty texto="Liga no encontrada." />;
  const l = liga.data;
  const esCopa = l.formato === "copa";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{l.nombre.toUpperCase()}</h1>
        <Badge>{esCopa ? "Copa" : "Liga"}</Badge>
      </div>
      <div className="flex gap-1" role="tablist">
        {(["partidos", "tabla", "jugadores"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => { setTab(t); }}
            className={`flex-1 min-h-[44px] rounded-lg font-medium ${tab === t ? "bg-emerald-700 text-white" : "bg-white border border-stone-200"}`}
          >
            {t === "partidos" ? "Partidos" : t === "tabla" ? (esCopa ? "Llaves" : "Tabla") : "Jugadores"}
          </button>
        ))}
      </div>
      {tab === "partidos" ? <PartidosTab ligaId={id} /> : null}
      {tab === "tabla" ? (esCopa ? <LlavesTab ligaId={id} nombres={mapaEquipos} /> : <TablaTab ligaId={id} nombres={mapaEquipos} />) : null}
      {tab === "jugadores" ? <JugadoresTab ligaId={id} /> : null}
    </div>
  );
}

function PartidosTab({ ligaId }: { ligaId: string }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(() => api.get<PartidoRow[]>(`/partidos?ligaId=${ligaId}`), 15_000);
  const { mapaEquipos } = useNombres();
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin partidos." />;
  return (
    <div className="flex flex-col gap-2">
      {porFechaDesc(data).map((p) => (
        <Link key={p.id} to={`/partidos/${p.id}`}>
          <Card>
            <div className="min-h-11 flex justify-between">
              <span className="font-medium">
                {mapaEquipos.get(p.localId) ?? "?"} vs {mapaEquipos.get(p.visitaId) ?? "?"}
              </span>
              <div className="text-sm text-stone-500 flex gap-2">
                {
                  p.fase && <span>{p.fase || "—"}</span>
                }
                <span>{p.fecha.slice(0, 10) || "—"}</span>
                <span>{p.estado}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function TablaTab({ ligaId, nombres }: { ligaId: string; nombres: Map<string, string> }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(
    () => api.get<FilaEquipo[]>(`/estadisticas/equipos?liga_ids=${ligaId}`),
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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-stone-500">
            <SortTH col="nombre" label="Equipo" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
            <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pg" label="G" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pe" label="E" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pp" label="P" orden={orden.orden} onOrdenar={orden.alternar} />
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
  const { data, error, loading, refresh } = usePolling(() => api.get<PartidoRow[]>(`/partidos?ligaId=${ligaId}`), 15_000);
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin partidos." />;
  const porFase = new Map<string, PartidoRow[]>();
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
            <Link key={p.id} to={`/partidos/${p.id}`} className="block py-2 border-t border-stone-100 min-h-[44px]">
              {nombres.get(p.localId) ?? "?"} vs {nombres.get(p.visitaId) ?? "?"}
              {p.penalesLocal !== null && p.penalesVisita !== null ? (
                <span className="text-sm text-stone-500"> (pen. {p.penalesLocal}-{p.penalesVisita})</span>
              ) : null}
              {p.clasificadoId ? <span className="text-sm text-emerald-700"> → {nombres.get(p.clasificadoId)}</span> : null}
            </Link>
          ))}
        </Card>
      ))}
    </div>
  );
}

function JugadoresTab({ ligaId }: { ligaId: string }): JSX.Element {
  const { data, error, loading, refresh } = usePolling(
    () => api.get<FilaJugador[]>(`/estadisticas/jugadores?liga_ids=${ligaId}`),
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
      case "pj2":
        return f.pj;
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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-stone-500">
            <SortTH col="nombre" label="Jugador" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
            <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pg" label="PG" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pe" label="PE" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pp" label="PP" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="goles" label="Goles" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="autogoles" label="Autogoles" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="pj2" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="convocados" label="Convocado" orden={orden.orden} onOrdenar={orden.alternar} />
            <SortTH col="ausentes" label="Ausencias" orden={orden.orden} onOrdenar={orden.alternar} />
          </tr>
        </thead>
        <tbody>
          {orden.filas.map((f) => (
            <tr key={f.jugadorId} className="border-t border-stone-100">
              <td className="p-2 text-left">{f.nombre}</td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.pg}</td>
              <td className="p-2 text-center">{f.pe}</td>
              <td className="p-2 text-center">{f.pp}</td>
              <td className="p-2 text-center font-bold">{f.goles}</td>
              <td className="p-2 text-center">{f.autogoles}</td>
              <td className="p-2 text-center">{f.pj}</td>
              <td className="p-2 text-center">{f.convocados}</td>
              <td className="p-2 text-center">{f.ausentes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
