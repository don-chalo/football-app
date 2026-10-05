import { useMemo, useState, type JSX } from "react";
import { Collapsible, Content, Trigger } from "@radix-ui/react-collapsible";
import { mensajeError } from "../api/client";
import { services } from "../api/services";
import type { Convocatoria, EstadoPartido, Evento, TipoEvento } from "../api/types";
import { Badge, Button, Input, Sheet, Toast } from "./ui";
import { usePolling } from "../hooks/usePolling";
import { formatoHora } from "../utils/fecha";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

const TIPOS: Array<{ tipo: TipoEvento; txt: string }> = [
  { tipo: "gol", txt: "GOL" },
  { tipo: "autogol", txt: "AUTOGOL" },
  { tipo: "penal", txt: "PENAL" },
];

interface Props {
  partidoId: string;
  estadoPartido: EstadoPartido;
  localId: string;
  visitaId: string;
  convocatorias: Convocatoria[];
  eventos: Evento[];
  minutoAuto: number | null;
  inicioEn: string | null;
  finEn: string | null;
  minutoFin: number | null;
  nombreJugador: (id: string) => string;
  nombreEquipo: (id: string) => string;
  onCambio: () => void;
}

/**
 * Lista unica de convocatoria y carga de goles: todos los convocados
 * (presentes y ausentes) por equipo, tap en jugador -> sheet con
 * goles (segun estado), Ausente/Quitar, y alta por equipo.
 */
export function CargaVivo({ partidoId, estadoPartido, localId, visitaId, convocatorias, eventos, minutoAuto, inicioEn, finEn, minutoFin, nombreJugador, nombreEquipo, onCambio }: Props): JSX.Element {
  type Hoja =
    | { modo: "agregar"; convocatoriaId: string; jugadorId: string; equipoId: string; convocado: boolean }
    | { modo: "quitar"; jugadorId: string }
    | { modo: "agregar-jugador"; equipoId: string };
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [cronoAbierta, setCronoAbierta] = useState(estadoPartido === "finalizado");
  const [minuto, setMinuto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [tipoGol, setTipoGol] = useState<TipoEvento | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [deshacerId, setDeshacerId] = useState<string | null>(null);
  const [confirmarQuitar, setConfirmarQuitar] = useState<string | null>(null);
  const [avisoQuitar, setAvisoQuitar] = useState<string | null>(null);

  const catalogo = usePolling(() => services.jugadores.listar(), 60_000);

  const equipos = [localId, visitaId];
  const ofreceGoles = estadoPartido === "en_juego" || estadoPartido === "finalizado";
  const sinAcciones = estadoPartido === "suspendido";

  const conteos = useMemo(() => {
    const mapa = new Map<string, { goles: number; autogoles: number; penales: number }>();
    for (const e of eventos) {
      const actual = mapa.get(e.jugadorId) ?? { goles: 0, autogoles: 0, penales: 0 };
      if (e.tipo === "gol") actual.goles += 1;
      else if (e.tipo === "autogol") actual.autogoles += 1;
      else actual.penales += 1;
      mapa.set(e.jugadorId, actual);
    }
    return mapa;
  }, [eventos]);

  function textoConteos(jugadorId: string): string | null {
    const c = conteos.get(jugadorId);
    if (!c) return null;
    const partes: string[] = [];
    if (c.goles > 0) partes.push(`G ${String(c.goles)}`);
    if (c.autogoles > 0) partes.push(`AG ${String(c.autogoles)}`);
    if (c.penales > 0) partes.push(`P ${String(c.penales)}`);
    return partes.length > 0 ? partes.join(" · ") : null;
  }

  function tieneEventos(jugadorId: string): boolean {
    return textoConteos(jugadorId) !== null;
  }

  function cerrarHoja(): void {
    setHoja(null);
    setConfirmarQuitar(null);
    setAvisoQuitar(null);
  }

  async function registrar(tipo: TipoEvento): Promise<void> {
    if (!hoja || hoja.modo !== "agregar" || enviando) return;
    setTipoGol(tipo);
    setEnviando(true);
    setError(null);
    try {
      const min = minutoAuto ?? (minuto.trim() === "" ? null : Number(minuto));
      const ev = await services.eventos.registrar(partidoId, {
        jugadorId: hoja.jugadorId,
        equipoId: hoja.equipoId,
        tipo,
        minuto: min,
      });
      cerrarHoja();
      setMinuto("");
      setDeshacerId(ev.id);
      onCambio();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  async function marcarAusente(): Promise<void> {
    if (!hoja || hoja.modo !== "agregar" || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await services.convocatorias.marcar(hoja.convocatoriaId, hoja.convocado ? "ausente" : "convocado");
      cerrarHoja();
      onCambio();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  async function quitar(): Promise<void> {
    if (!hoja || hoja.modo !== "agregar") return;
    const convocatoriaId = hoja.convocatoriaId;
    if (confirmarQuitar !== convocatoriaId) {
      setConfirmarQuitar(convocatoriaId);
      setAvisoQuitar(null);
      return;
    }
    if (eventos.some((e) => e.jugadorId === hoja.jugadorId)) {
      setAvisoQuitar(`No se puede quitar a ${nombreJugador(hoja.jugadorId)}: tiene goles registrados, bórralos primero.`);
      setConfirmarQuitar(null);
      return;
    }
    setError(null);
    try {
      await services.convocatorias.quitar(convocatoriaId);
      cerrarHoja();
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  async function agregarJugador(equipoId: string, jugadorId: string): Promise<void> {
    setError(null);
    try {
      await services.convocatorias.agregar(partidoId, { jugadorId, equipoId });
      cerrarHoja();
      onCambio();
    } catch (err) {
      setError(err);
    }
  }

  async function borrar(id: string): Promise<void> {
    await services.eventos.eliminar(id);
    if (deshacerId === id) setDeshacerId(null);
    onCambio();
  }

  async function deshacer(): Promise<void> {
    if (!deshacerId) return;
    const id = deshacerId;
    setDeshacerId(null);
    await borrar(id);
  }

  const eventosJugador = hoja?.modo === "quitar" ? eventos.filter((e) => e.jugadorId === hoja.jugadorId) : [];
  const disponibles = (catalogo.data ?? []).filter((j) => !convocatorias.some((c) => c.jugadorId === j.id));
  const muestraFin = !!finEn || estadoPartido === "finalizado";
  const tituloHoja = !hoja
    ? ""
    : hoja.modo === "quitar"
      ? `Quitar gol de ${nombreJugador(hoja.jugadorId)}`
      : hoja.modo === "agregar-jugador"
        ? `${nombreEquipo(hoja.equipoId)} · Agregar`
        : nombreJugador(hoja.jugadorId);

  return (
    <div className="flex flex-col gap-3">
      {equipos.map((equipoId) => {
        const lista = convocatorias.filter((c) => c.equipoId === equipoId);
        return (
          <div key={equipoId}>
            <h3 className="font-bold mb-1">{nombreEquipo(equipoId)}</h3>
            <div className="flex flex-col gap-1">
              {lista.map((c) => {
                const ausente = c.estado === "ausente";
                return (
                  <div key={c.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={sinAcciones}
                      onClick={() => {
                        setError(null);
                        setHoja({ modo: "agregar", convocatoriaId: c.id, jugadorId: c.jugadorId, equipoId: c.equipoId, convocado: !ausente });
                      }}
                      className={`min-h-13 flex flex-1 items-center justify-between gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-3 text-left font-medium active:bg-cancha-100${ausente ? " opacity-60" : ""} disabled:opacity-60`}
                    >
                      <span className="min-w-0 wrap-break-words">
                        <span>{nombreJugador(c.jugadorId)}</span>
                        {ausente ? <span> (ausente)</span> : null}
                      </span>
                      {textoConteos(c.jugadorId) ? (
                        <span className="shrink-0 text-sm font-normal text-stone-500">{textoConteos(c.jugadorId)}</span>
                      ) : null}
                    </button>
                    {tieneEventos(c.jugadorId) && !sinAcciones ? (
                      <button
                        type="button"
                        aria-label={`Quitar gol de ${nombreJugador(c.jugadorId)}`}
                        onClick={() => {
                          setError(null);
                          setHoja({ modo: "quitar", jugadorId: c.jugadorId });
                        }}
                        className="min-h-11 min-w-11 shrink-0 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-red-700 font-bold"
                      >
                        -
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {!sinAcciones ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setHoja({ modo: "agregar-jugador", equipoId });
                  }}
                  className="min-h-11 flex items-center justify-center gap-2 rounded-lg border border-dashed border-cancha-600/40 px-3 text-cancha-700 font-medium"
                >
                  + Agregar jugador
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      {error ? <p className="text-red-700">{mensajeError(error)} (no se registró, reintenta)</p> : null}

      <Collapsible open={cronoAbierta} onOpenChange={setCronoAbierta}>
        <Trigger asChild>
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between font-bold"
          >
            <span>{`Cronología (${String(eventos.length)})`}</span>
            {
              cronoAbierta ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />
            }
            {/* <span aria-hidden="true">{cronoAbierta ? "-" : "+"}</span> */}
          </button>
        </Trigger>
        <Content>
          {eventos.length === 0 && !inicioEn && !muestraFin ? (
            <p className="text-sm text-stone-500">Sin goles.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {muestraFin ? (
                <li className="flex items-center bg-cancha-50 border border-cancha-600/20 rounded-lg px-3 min-h-11">
                  <span className="text-sm font-medium text-cancha-800">
                    {finEn ? `Fin ${formatoHora(finEn)}${minutoFin !== null ? ` · ${String(minutoFin)}'` : ""}` : "Fin"}
                  </span>
                </li>
              ) : null}
              {[...eventos].reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 min-h-11">
                  <span className="text-sm">
                    {nombreJugador(e.jugadorId)} · <Badge>{e.tipo}</Badge>{e.minuto !== null ? ` - ${String(e.minuto)}'` : ""}
                  </span>
                  <button
                    type="button"
                    aria-label={`Borrar gol de ${nombreJugador(e.jugadorId)}`}
                    onClick={() => void borrar(e.id)}
                    className="min-h-11 px-2 text-red-700 font-bold"
                  >
                    ×
                  </button>
                </li>
              ))}
              {inicioEn || estadoPartido === "en_juego" || estadoPartido === "finalizado" ? (
                <li className="flex items-center bg-cancha-50 border border-cancha-600/20 rounded-lg px-3 min-h-11">
                  <span className="text-sm font-medium text-cancha-800">
                    Inicio {inicioEn && formatoHora(inicioEn)}
                  </span>
                </li>
              ) : null}
            </ul>
          )}
        </Content>
      </Collapsible>

      <Sheet
        open={hoja !== null}
        onOpenChange={(v) => { if (!v) cerrarHoja(); }}
        title={tituloHoja}
      >
        {hoja?.modo === "quitar" ? (
          <div className="flex flex-col gap-2">
            {eventosJugador.length === 0 ? (
              <p className="text-sm text-stone-500">Sin goles de este jugador.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {[...eventosJugador].reverse().map((e) => (
                  <li key={e.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 min-h-11">
                    <span className="text-sm">
                      {nombreJugador(e.jugadorId)} · <Badge>{e.tipo}</Badge>
                    </span>
                    <button
                      type="button"
                      aria-label={`Borrar gol de ${nombreJugador(e.jugadorId)}`}
                      onClick={() => void borrar(e.id)}
                      className="min-h-11 px-2 text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : hoja?.modo === "agregar-jugador" ? (
          <div className="flex flex-col gap-1">
            {disponibles.length === 0 ? (
              <p className="text-sm text-stone-500">Sin jugadores disponibles.</p>
            ) : (
              disponibles.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => void agregarJugador(hoja.equipoId, j.id)}
                  className="min-h-13 flex items-center rounded-lg bg-neutral-50 border border-neutral-200 px-3 text-left font-medium active:bg-cancha-100"
                >
                  {j.nombre}
                </button>
              ))
            )}
          </div>
        ) : hoja?.modo === "agregar" ? (
          <div className="flex flex-col gap-2">
            {ofreceGoles ? (
              <>
                {TIPOS.map((t) => (
                  <Button key={t.tipo} disabled={enviando} onClick={() => void registrar(t.tipo)} className="min-h-14 text-lg">
                    {enviando && t.tipo === tipoGol ? "Enviando..." : t.txt}
                  </Button>
                ))}
                {minutoAuto !== null ? (
                  <p className="text-sm text-cancha-700 font-medium">Minuto: {minutoAuto}&apos; (auto)</p>
                ) : (
                  <Input
                    aria-label="Minuto (opcional)"
                    placeholder="Minuto (opcional)"
                    inputMode="numeric"
                    value={minuto}
                    onChange={(e) => { setMinuto(e.target.value); }}
                  />
                )}
              </>
            ) : null}
            {avisoQuitar ? <p className="text-red-700">{avisoQuitar}</p> : null}
            {confirmarQuitar === hoja.convocatoriaId ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void quitar()}
                  className="min-h-11 flex-1 rounded-lg bg-red-700 px-2 font-bold text-white text-sm"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmarQuitar(null); }}
                  className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-2 text-sm"
                >
                  No
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => void marcarAusente()}
                  className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-2 text-sm underline disabled:opacity-50"
                >
                  {hoja.convocado ? "Ausente" : "Presente"}
                </button>
                <button
                  type="button"
                  onClick={() => void quitar()}
                  className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-2 text-red-700 text-sm"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Sheet>

      {deshacerId ? <Toast texto="Gol registrado" accionTxt="Deshacer" onAccion={() => { void deshacer(); }} /> : null}
    </div>
  );
}
