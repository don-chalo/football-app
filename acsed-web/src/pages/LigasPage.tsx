import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { services } from "../api/services";
import type { Liga } from "../api/types";
import type { PartidoListado } from "../api/partidos";
import { Badge, Card, Empty, ErrorMsg, SkeletonFilas, Title } from "../components/ui";
import { minutoDePartido } from "../hooks/useCronometro";
import { useMapaEquipos } from "../hooks/useNombres";
import { usePolling } from "../hooks/usePolling";
import { formatoFechaCorta } from "../utils/fecha";

/** Partidos de todas las ligas; se recarga cuando cambia la lista de ligas. */
function FilaEnJuego({ p, nombre }: { p: PartidoListado; nombre: (id: string) => string }): JSX.Element {
  const minuto = minutoDePartido(p, Date.now());
  return (
    <Link key={p.id} to={`/partidos/${p.id}`}>
      <Card className="border-energia-400/60">
        <div className="flex items-center justify-between min-h-11 gap-2">
          <span className="font-bold min-w-0 wrap-break-words">
            {nombre(p.localId)} {p.marcador.local} - {p.marcador.visita} {nombre(p.visitaId)}
          </span>
          <span className="shrink-0 text-sm font-bold text-cancha-700 tabular-nums">
            {minuto !== null ? `${minuto}'` : "–"}
          </span>
        </div>
      </Card>
    </Link>
  );
}

/** Partidos de todas las ligas; se recarga cuando cambia la lista de ligas. */
function usePartidosTodas(ligas: Liga[] | null): PartidoListado[] {
  const [partidos, setPartidos] = useState<PartidoListado[]>([]);
  useEffect(() => {
    if (!ligas || ligas.length === 0) {
      setPartidos([]);
      return;
    }
    let vivo = true;
    void (async () => {
      const rs = await Promise.allSettled(ligas.map((l) => services.partidos.porLiga(l.id)));
      if (vivo) setPartidos(rs.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
    })();
    return () => {
      vivo = false;
    };
  }, [ligas]);
  return partidos;
}

export function LigasPage(): JSX.Element {
  const { data, error, loading, refresh } = usePolling(() => services.ligas.listar(), 30_000);
  const mapaEquipos = useMapaEquipos();
  const todos = usePartidosTodas(data);
  if (loading && !data) return <SkeletonFilas />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin ligas todavía." />;
  const nombre = (id: string): string => mapaEquipos.get(id) ?? "?";
  const enJuego = todos
    .filter((p) => p.estado === "en_juego")
    .sort((a, b) => (b.inicioEn ?? b.fecha).localeCompare(a.inicioEn ?? a.fecha));
  const proximos = todos
    .filter((p) => p.estado === "programado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5);
  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">LIGAS/COPAS</h1>
      </Title>
      {enJuego.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-energia-400 animate-pulse" aria-hidden="true" />
            En juego ahora
          </h2>
          {enJuego.map((p) => (
            <FilaEnJuego key={p.id} p={p} nombre={nombre} />
          ))}
        </div>
      ) : null}
      {proximos.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Próximos partidos</h2>
          {proximos.map((p) => (
            <Link key={p.id} to={`/partidos/${p.id}`}>
              <Card>
                <div className="flex items-center justify-between min-h-11 gap-2">
                  <span className="min-w-0 wrap-break-words">
                    {nombre(p.localId)} vs {nombre(p.visitaId)}
                  </span>
                  <span className="shrink-0 text-sm text-stone-500">{formatoFechaCorta(p.fecha)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
      {data.length > 0 ? (
        <>
        <h2 className="font-bold">Ligas y copas</h2>
          {data.map((l) => (
            <Link key={l.id} to={`/ligas/${l.id}`}>
              <Card>
                <div className="flex items-center justify-between min-h-11">
                  <span className="font-bold">{l.nombre}</span>
                  <Badge>{l.formato === "liga" ? `Liga${l.idaVuelta ? " ida/vuelta" : ""}` : `Copa${l.idaVuelta ? " ida+vuelta" : ""}`}</Badge>
                </div>
              </Card>
            </Link>
          ))}        
        </>
      ) : <Empty texto="Sin ligas todavía." />}
    </div>
  );
}
