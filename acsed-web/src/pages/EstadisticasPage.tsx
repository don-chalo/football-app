import { useState, type JSX } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { services } from "../api/services";
import type { FilaEquipo, FilaJugador } from "../api/types";
import { Button, Card, Empty, ErrorMsg, Input, Loading, Title } from "../components/ui";
import { TablaEquipos as TablaPosiciones } from "../components/TablaEquipos";
import { TablaJugadores } from "../components/TablaJugadores";
import { usePolling } from "../hooks/usePolling";
import { useOrden } from "../hooks/useOrden";
import { rendimiento, rendimientoValor } from "../utils/rendimiento";
import { Tab } from "../components/Tab";

function anoActual(): { desde: string; hasta: string } {
  const y = new Date().getFullYear();
  return { desde: `${String(y)}-01-01`, hasta: `${String(y)}-12-31` };
}

const TABS = ["equipos", "jugadores", "duelo"] as const;
type Tab = (typeof TABS)[number];

function esTab(v: string): v is Tab {
  return (TABS as readonly string[]).includes(v);
}

export function EstadisticasPage(): JSX.Element {
  const { tab: tabParam = "equipos" } = useParams();
  const navigate = useNavigate();

  if (!esTab(tabParam)) return <Navigate to="/estadisticas/equipos" replace />;
  const tab: Tab = tabParam;
  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">ESTADÍSTICAS</h1>
      </Title>
      <Tabs.Tabs value={tab} onValueChange={(v) => { navigate(`/estadisticas/${v}`); }}>
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

function TablaGlobal(): JSX.Element {
  const d = anoActual();
  const [desde, setDesde] = useState(d.desde);
  const [hasta, setHasta] = useState(d.hasta);
  const { data, error, loading, refresh } = usePolling(
    () => services.estadisticas.porEquipos({ desde, hasta }),
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
      case "dif":
        return f.dif;
      case "rend":
        return rendimientoValor(f.pg, f.pe, f.pj);
      default:
        return f.pts;
    }
  });
  return <TablaPosiciones filas={orden.filas} orden={orden} nombreDe={(f) => f.nombre} />;
}

function JugadoresGlobal(): JSX.Element {
  const d = anoActual();
  const [desde, setDesde] = useState(d.desde);
  const [hasta, setHasta] = useState(d.hasta);
  const { data, error, loading, refresh } = usePolling(
    () => services.estadisticas.porJugadores({ desde, hasta }),
    15_000,
  );
  return (
    <Card className="overflow-x-auto">
      <FiltrosFechas desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} onFiltrar={refresh} />
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorMsg error={error} onRetry={refresh} /> : null}
      {data ? (
        <TablaJugadores filas={data} />
      ) : null}
    </Card>
  );
}

function Duelo(): JSX.Element {
  const equipos = usePolling(() => services.equipos.listar(), 60_000);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [ver, setVer] = useState(0);
  const hist = usePolling(
    () =>
      a && b
        ? services.estadisticas.enfrentamiento(a, b)
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
    <div className="flex flex-col md:flex-row gap-2 mb-3">
      <div className="flex flex-1 gap-2">
        <div className="flex-1 min-w-0">
          <Input aria-label="Desde" type="date" value={desde} onChange={(e) => { setDesde(e.target.value); }} />
        </div>
        <div className="flex-1 min-w-0">
          <Input aria-label="Hasta" type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); }} />
        </div>
      </div>
      <Button onClick={onFiltrar} className="w-full md:w-auto">
        Filtrar
      </Button>
    </div>
  );
}
