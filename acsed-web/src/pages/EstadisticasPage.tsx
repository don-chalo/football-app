import { useState, type JSX } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { api } from "../api/client";
import type { Equipo, FilaEquipo, FilaJugador, Historial } from "../api/types";
import { Button, Card, Empty, ErrorMsg, Input, Loading, Title } from "../components/ui";
import { SortTH } from "../components/SortTH";
import { usePolling } from "../hooks/usePolling";
import { useOrden } from "../hooks/useOrden";
import { Tab } from "../components/Tab";

function anoActual(): { desde: string; hasta: string } {
  const y = new Date().getFullYear();
  return { desde: `${String(y)}-01-01`, hasta: `${String(y)}-12-31` };
}

export function EstadisticasPage(): JSX.Element {
  const [tab, setTab] = useState<"equipos" | "jugadores" | "duelo">("equipos");
  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">ESTADÍSTICAS</h1>
      </Title>
      <Tabs.Tabs defaultValue="equipos" onValueChange={(v) => { setTab(v as "equipos" | "jugadores" | "duelo"); }}>
        <Tabs.List className="w-full flex justify-around mb-2">
          <Tab value="equipos" label="Equipos" selected={tab === "equipos"} />
          <Tab value="jugadores" label="Jugadores" selected={tab === "jugadores"} />
          <Tab value="duelo" label="Duelo" selected={tab === "duelo"} />
        </Tabs.List>
        <Tabs.Content value="equipos">
          <TablaGlobal />
        </Tabs.Content>
        <Tabs.Content value="jugadores">
          <JugadoresGlobal />
        </Tabs.Content>
        <Tabs.Content value="duelo">
          <Duelo />
        </Tabs.Content>
      </Tabs.Tabs>
    </div>
  );
}

function rangoQuery(desde: string, hasta: string): string {
  return `desde=${desde}&hasta=${hasta}`;
}

function TablaGlobal(): JSX.Element {
  const d = anoActual();
  const [desde, setDesde] = useState(d.desde);
  const [hasta, setHasta] = useState(d.hasta);
  const { data, error, loading, refresh } = usePolling(
    () => api.get<FilaEquipo[]>(`/estadisticas/equipos?${rangoQuery(desde, hasta)}`),
    15_000,
  );
  return (
    <Card>
      <FiltrosFechas desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} onFiltrar={refresh} />
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorMsg error={error} onRetry={refresh} /> : null}
      {data && data.length === 0 ? <Empty texto="Sin datos." /> : null}
      {data && data.length > 0 ? (
        <TablaEquipos filas={data} />
      ) : null}
    </Card>
  );
}

function TablaEquipos({ filas }: { filas: FilaEquipo[] }): JSX.Element {
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
      default:
        return f.pts;
    }
  });
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-stone-500">
          <SortTH col="nombre" label="Equipo" orden={orden.orden} onOrdenar={orden.alternar} align="left" />
          <SortTH col="pj" label="PJ" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pg" label="G" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pe" label="E" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pp" label="P" orden={orden.orden} onOrdenar={orden.alternar} />
          <SortTH col="pts" label="Pts" orden={orden.orden} onOrdenar={orden.alternar} />
        </tr>
      </thead>
      <tbody>
        {orden.filas.map((f) => (
          <tr key={f.equipoId} className="border-t border-stone-100">
            <td className="p-2 font-medium">{f.nombre}</td>
            <td className="p-2 text-center">{f.pj}</td>
            <td className="p-2 text-center">{f.pg}</td>
            <td className="p-2 text-center">{f.pe}</td>
            <td className="p-2 text-center">{f.pp}</td>
            <td className="p-2 text-center font-bold">{f.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JugadoresGlobal(): JSX.Element {
  const d = anoActual();
  const [desde, setDesde] = useState(d.desde);
  const [hasta, setHasta] = useState(d.hasta);
  const { data, error, loading, refresh } = usePolling(
    () => api.get<FilaJugador[]>(`/estadisticas/jugadores?${rangoQuery(desde, hasta)}`),
    15_000,
  );
  return (
    <Card>
      <FiltrosFechas desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} onFiltrar={refresh} />
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorMsg error={error} onRetry={refresh} /> : null}
      {data ? (
        <TablaJugadores filas={data} />
      ) : null}
    </Card>
  );
}

function TablaJugadores({ filas }: { filas: FilaJugador[] }): JSX.Element {
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
      case "goles":
        return f.goles;
      case "autogoles":
        return f.autogoles;
      case "pj2":
        return f.pj;
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
            <td className="p-2 font-medium">{f.nombre}</td>
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
  );
}

function Duelo(): JSX.Element {
  const equipos = usePolling(() => api.get<Equipo[]>("/equipos"), 60_000);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [ver, setVer] = useState(0);
  const hist = usePolling(
    () =>
      a && b
        ? api.get<Historial>(`/estadisticas/enfrentamientos?equipo_a=${a}&equipo_b=${b}`)
        : Promise.resolve(null),
    60_000,
    ver > 0,
  );
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <select aria-label="Equipo A" className="min-h-11 rounded-lg border px-3 bg-white" value={a} onChange={(e) => { setA(e.target.value); }}>
          <option value="">Equipo A...</option>
          {(equipos.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <select aria-label="Equipo B" className="min-h-11 rounded-lg border px-3 bg-white" value={b} onChange={(e) => { setB(e.target.value); }}>
          <option value="">Equipo B...</option>
          {(equipos.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <Button disabled={!a || !b || a === b} onClick={() => { hist.refresh(); setVer((v) => v + 1); }}>
          Ver duelo
        </Button>
      </div>
      {hist.error ? <ErrorMsg error={hist.error} onRetry={hist.refresh} /> : null}
      {hist.data ? (
        <p className="mt-3 text-center font-bold">
          PJ {hist.data.pj} · Gana A {hist.data.ganA} · Emp {hist.data.emp} · Gana B {hist.data.ganB} · {hist.data.gfA}-{hist.data.gfB}
        </p>
      ) : null}
    </Card>
  );
}

function FiltrosFechas({
  desde, hasta, setDesde, setHasta, onFiltrar,
}: {
  desde: string;
  hasta: string;
  setDesde: (v: string) => void;
  setHasta: (v: string) => void;
  onFiltrar: () => void;
}): JSX.Element {
  return (
    <div className="flex gap-2 mb-3">
      <Input aria-label="Desde" type="date" value={desde} onChange={(e) => { setDesde(e.target.value); }} />
      <Input aria-label="Hasta" type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); }} />
      <Button variant="ghost" onClick={onFiltrar}>
        Filtrar
      </Button>
    </div>
  );
}
