import { useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router-dom";
import { api, mensajeError } from "../api/client";
import type { Jugador, PartidoDetalle } from "../api/types";
import { CargaVivo } from "../components/CargaVivo";
import { ActorLine, Badge, Button, Card, Empty, ErrorMsg, Input, Loading } from "../components/ui";
import { useNombres } from "../hooks/useNombres";
import { usePolling } from "../hooks/usePolling";
import { Collapsible, Content, Trigger } from "@radix-ui/react-collapsible";

export function PartidoManagePage(): JSX.Element {
  const { id = "" } = useParams();
  const detalle = usePolling(() => api.get<PartidoDetalle>(`/partidos/${id}`), 5_000);
  const { mapaEquipos, mapaJugadores } = useNombres();
  const [open, setOpen] = useState(true);

  if (detalle.loading && !detalle.data) return <Loading />;
  if (detalle.error && !detalle.data) return <ErrorMsg error={detalle.error} onRetry={detalle.refresh} />;
  if (!detalle.data) return <Empty texto="Partido no encontrado." />;
  const p = detalle.data;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            {mapaEquipos.get(p.localId) ?? "?"} {p.marcador.local} - {p.marcador.visita} {mapaEquipos.get(p.visitaId) ?? "?"}
          </h1>
          <Badge>{p.estado}</Badge>
        </div>
        <ActorLine createdBy={p.createdBy} createdAt={p.createdAt} />
        <EstadoBotones id={p.id} estado={p.estado} onCambio={detalle.refresh} />
      </Card>

      <Card>
        <Collapsible open={open} onOpenChange={setOpen}>
          <Trigger asChild>
            <div className="font-bold mb-2 flex flex-row justify-between">
              <h2 className="font-bold mb-2">Convocados</h2>
              <h2 className="font-bold mb-2">{open ? "-" : "+"}</h2>
            </div>
          </Trigger>
          <Content>
            <Convocatorias
              partidoId={p.id}
              localId={p.localId}
              visitaId={p.visitaId}
              lista={p.convocatorias}
              eventos={p.eventos}
              onCambio={detalle.refresh}
            />
          </Content>
        </Collapsible>
      </Card>

      {(p.estado === "en_juego" || p.estado === "finalizado") && (
        <Card>
          <h2 className="font-bold mb-2">{p.estado === "en_juego" ? "Cargar goles" : "Goles (corrección)"}</h2>
          <CargaVivo
            partidoId={p.id}
            convocatorias={p.convocatorias}
            eventos={p.eventos}
            nombreJugador={(jid) => mapaJugadores.get(jid) ?? jid}
            nombreEquipo={(eid) => mapaEquipos.get(eid) ?? eid}
            onCambio={detalle.refresh}
          />
        </Card>
      )}

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

function EstadoBotones({ id, estado, onCambio }: { id: string; estado: string; onCambio: () => void }): JSX.Element {
  const [error, setError] = useState<unknown>(null);
  async function cambiar(nuevo: string): Promise<void> {
    setError(null);
    try {
      await api.patch(`/partidos/${id}/estado`, { estado: nuevo });
      onCambio();
    } catch (err) {
      setError(err);
    }
  }
  return (
    <div className="flex gap-2 mt-2">
      {estado === "programado" ? <Button onClick={() => void cambiar("en_juego")}>Poner en juego</Button> : null}
      {estado === "en_juego" ? <Button onClick={() => void cambiar("finalizado")}>Finalizar</Button> : null}
      {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
    </div>
  );
}

export function Convocatorias({ partidoId, localId, visitaId, lista, eventos, onCambio }: {
  partidoId: string;
  localId: string;
  visitaId: string;
  lista: PartidoDetalle["convocatorias"];
  eventos: PartidoDetalle["eventos"];
  onCambio: () => void;
}): JSX.Element {
  const jugadores = usePolling(() => api.get<Jugador[]>("/jugadores"), 60_000);
  const { mapaEquipos, mapaJugadores } = useNombres();
  const [jugadorId, setJugadorId] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);

  async function agregar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!jugadorId || !equipoId) return;
    setError(null);
    try {
      await api.post(`/partidos/${partidoId}/convocatorias`, { jugadorId, equipoId });
      setJugadorId("");
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  async function marcar(id: string, estado: string): Promise<void> {
    try {
      await api.patch(`/convocatorias/${id}`, { estado });
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  async function quitar(c: PartidoDetalle["convocatorias"][number]): Promise<void> {
    if (confirmarId !== c.id) {
      setConfirmarId(c.id);
      setAviso(null);
      return;
    }
    if (eventos.some((e) => e.jugadorId === c.jugadorId)) {
      setAviso(`No se puede quitar a ${mapaJugadores.get(c.jugadorId) ?? "?"}: tiene goles registrados, bórralos primero.`);
      setConfirmarId(null);
      return;
    }
    setConfirmarId(null);
    setAviso(null);
    try {
      await api.del(`/convocatorias/${c.id}`);
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
      {aviso ? <p className="text-red-700">{aviso}</p> : null}
      {
        Array.from(mapaEquipos.entries()).map(([id, nombre]) => {
          return <div key={id} className="flex flex-col gap-1">
            <p className="font-bold" key={id}>{nombre}</p>
            {lista.filter((c) => c.equipoId === id).map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-stone-50 rounded-lg px-3 min-h-11">
                <span className="text-sm">
                  {mapaJugadores.get(c.jugadorId) ?? "?"}
                  {c.estado === "ausente" ? " (ausente)" : ""}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => void marcar(c.id, c.estado === "ausente" ? "convocado" : "ausente")}
                    className="min-h-11 px-2 underline text-sm"
                  >
                    {c.estado === "ausente" ? "Presente" : "Ausente"}
                  </button>
                  {confirmarId === c.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void quitar(c)}
                        className="min-h-11 px-2 font-bold text-red-700 text-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConfirmarId(null); }}
                        className="min-h-11 px-2 text-sm"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void quitar(c)}
                      className="min-h-11 px-2 text-red-700 text-sm"
                    >
                      Quitar
                    </button>
                  )}
                </span>
              </div>
            ))}            
          </div>;
        })
      }

      <form onSubmit={(e) => { void agregar(e); }} className="flex gap-2">
        <select aria-label="Jugador" className="flex-1 min-h-11 rounded-lg border px-2 bg-white" value={jugadorId} onChange={(e) => { setJugadorId(e.target.value); }}>
          <option value="">Jugador...</option>
          {(jugadores.data ?? []).map((j) => (
            <option key={j.id} value={j.id}>{j.nombre}</option>
          ))}
        </select>
        <select aria-label="Equipo" className="min-h-11 rounded-lg border px-2 bg-white" value={equipoId} onChange={(e) => { setEquipoId(e.target.value); }}>
          <option value="">Equipo...</option>
          <option value={localId}>{mapaEquipos.get(localId) ?? "Local"}</option>
          <option value={visitaId}>{mapaEquipos.get(visitaId) ?? "Visita"}</option>
        </select>
        <Button disabled={!jugadorId || !equipoId}>+</Button>
      </form>
    </div>
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
      await api.patch(`/partidos/${partidoId}`, {
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
      <select aria-label="Clasificado" className="min-h-11 rounded-lg border px-3 bg-white" value={clas} onChange={(e) => { setClas(e.target.value); }}>
        <option value="">Clasificado...</option>
        <option value={localId}>{nombreEquipo(localId)}</option>
        <option value={visitaId}>{nombreEquipo(visitaId)}</option>
      </select>
      {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
      {ok ? <p className="text-emerald-700">Guardado (no suma a goleadores).</p> : null}
      <Button>Guardar penales</Button>
    </form>
  );
}
