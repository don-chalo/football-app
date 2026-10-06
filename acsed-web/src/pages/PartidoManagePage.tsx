import { useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router-dom";
import { mensajeError } from "../api/client";
import { services } from "../api/services";
import type { EstadoPartido } from "../api/types";
import { CargaVivo } from "../components/CargaVivo";
import { Cronometro } from "../components/Cronometro";
import { Badge, Button, Card, Empty, ErrorMsg, Input, SkeletonFilas, Title, tonoPorEstado } from "../components/ui";
import { minutoDePartido } from "../hooks/useCronometro";
import { useMapaEquipos, useMapaJugadores } from "../hooks/useNombres";
import { usePolling } from "../hooks/usePolling";
import { formatoFechaCorta } from "../utils/fecha";

export function PartidoManagePage(): JSX.Element {
  const { id = "" } = useParams();
  const detalle = usePolling(() => services.partidos.detalle(id), 15_000);
  const mapaEquipos = useMapaEquipos();
  const mapaJugadores = useMapaJugadores();

  if (detalle.loading && !detalle.data) return <SkeletonFilas />;
  if (detalle.error && !detalle.data) return <ErrorMsg error={detalle.error} onRetry={detalle.refresh} />;
  if (!detalle.data) return <Empty texto="Partido no encontrado." />;
  const p = detalle.data;

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-lg font-bold">
          {(mapaEquipos.get(p.localId) ?? "?").toUpperCase()} {p.marcador.local} - {p.marcador.visita} {(mapaEquipos.get(p.visitaId) ?? "?").toUpperCase()}
        </h1>
        <Badge tono={tonoPorEstado(p.estado)} pulso={p.estado === "en_juego"}>{p.estado}</Badge>
      </Title>
      <div>
        {p.penalesLocal !== null && p.penalesVisita !== null ? (
          <p className="text-sm">
            Penales: {p.penalesLocal}-{p.penalesVisita}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm text-neutral-800">
          <span>
            {(p.fase && " · ") || ""}
          </span>
          <span className="font-bold">Fecha de juego:&nbsp;</span>
          <span>
            {formatoFechaCorta(p.fecha)}
          </span>
        </p>
      </div>
        {/* <ActorLine createdBy={p.createdBy} createdAt={p.createdAt} /> */}
      <EstadoBotones id={p.id} estado={p.estado} fecha={p.fecha} onCambio={detalle.refresh} />

      {p.estado === "en_juego" ? <Cronometro partido={p} onCambio={detalle.refresh} /> : null}

      <Card>
        <h2 className="font-bold mb-2">Convocatoria y goles</h2>
        <CargaVivo
          partidoId={p.id}
          estadoPartido={p.estado}
          localId={p.localId}
          visitaId={p.visitaId}
          convocatorias={p.convocatorias}
          eventos={p.eventos}
          minutoAuto={p.estado === "en_juego" && !p.pausaDesde ? minutoDePartido(p, Date.now()) : null}
          inicioEn={p.inicioEn}
          finEn={p.finEn}
          minutoFin={p.finEn ? minutoDePartido(p, Date.now()) : null}
          nombreJugador={(jid) => mapaJugadores.get(jid) ?? jid}
          nombreEquipo={(eid) => mapaEquipos.get(eid) ?? eid}
          onCambio={detalle.refresh}
        />
      </Card>

      <Card>
        <h2 className="font-bold mb-2">Penales (definición)</h2>
        <PenalesForm
          partidoId={p.id}
          localId={p.localId}
          visitaId={p.visitaId}
          nombreEquipo={(eid) => mapaEquipos.get(eid) ?? eid}
          onCambio={detalle.refresh}
        />
      </Card>
    </div>
  );
}

function EstadoBotones({ id, estado, fecha, onCambio }: { id: string; estado: string; fecha: string; onCambio: () => void }): JSX.Element {
  const [error, setError] = useState<unknown>(null);
  const [confirmaSusp, setConfirmaSusp] = useState(false);
  const [confirmaFin, setConfirmaFin] = useState(false);
  const puedeIniciar = Date.now() >= new Date(fecha).getTime();
  async function cambiar(nuevo: EstadoPartido): Promise<void> {
    setError(null);
    try {
      await services.partidos.cambiarEstado(id, nuevo);
      setConfirmaSusp(false);
      setConfirmaFin(false);
      onCambio();
    } catch (err) {
      setError(err);
    }
  }
  return (
    <>
      {
        (estado === "programado" || estado === "en_juego") && <Card>
          <div className="flex flex-col gap-2">
            {estado === "programado" ? (
              <>
                <Button className="w-full" disabled={!puedeIniciar} onClick={() => void cambiar("en_juego")}>Poner en juego</Button>
                {!puedeIniciar ? <p className="text-sm text-stone-500">Disponible desde {formatoFechaCorta(fecha)}</p> : null}
                {confirmaSusp ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void cambiar("suspendido")}
                      className="min-h-11 flex-1 rounded-lg bg-red-700 px-2 font-bold text-white text-sm"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmaSusp(false); }}
                      className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-2 text-sm"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConfirmaSusp(true); }}
                    className="min-h-11 w-full rounded-lg border border-neutral-300 px-2 text-red-700 text-sm"
                  >
                    Suspender
                  </button>
                )}
              </>
            ) : null}
            {estado === "en_juego" ? (
              confirmaFin ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void cambiar("finalizado")}
                    className="min-h-11 flex-1 rounded-lg bg-red-700 px-2 font-bold text-white text-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmaFin(false); }}
                    className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-2 text-sm"
                  >
                    No
                  </button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => { setConfirmaFin(true); }}>Finalizar</Button>
              )
            ) : null}
            {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
          </div>
        </Card>
      }
    </>
  );
}

function PenalesForm({ partidoId, localId, visitaId, nombreEquipo, onCambio }: {
  partidoId: string;
  localId: string;
  visitaId: string;
  nombreEquipo: (id: string) => string;
  onCambio: () => void;
}): JSX.Element {
  const [gl, setGl] = useState("");
  const [gv, setGv] = useState("");
  const [clas, setClas] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [ok, setOk] = useState(false);

  async function guardar(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setOk(false);
    try {
      await services.partidos.actualizarPenales(partidoId, {
        penalesLocal: gl === "" ? null : Number(gl),
        penalesVisita: gv === "" ? null : Number(gv),
        clasificadoId: clas === "" ? null : clas,
      });
      setOk(true);
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <form onSubmit={(e) => { void guardar(e); }} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input aria-label="Penales local" placeholder="Pen. local" inputMode="numeric" value={gl} onChange={(e) => { setGl(e.target.value); }} />
        <Input aria-label="Penales visita" placeholder="Pen. visita" inputMode="numeric" value={gv} onChange={(e) => { setGv(e.target.value); }} />
      </div>
      <select aria-label="Clasificado" className="min-h-11 rounded-lg border px-3 bg-nutral-100" value={clas} onChange={(e) => { setClas(e.target.value); }}>
        <option value="">Clasificado...</option>
        <option value={localId}>{nombreEquipo(localId)}</option>
        <option value={visitaId}>{nombreEquipo(visitaId)}</option>
      </select>
      {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
      {ok ? <p className="text-cancha-700">Guardado (no suma a goleadores).</p> : null}
      <Button>Guardar penales</Button>
    </form>
  );
}
