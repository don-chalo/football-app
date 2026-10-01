import { useMemo, useState, type JSX } from "react";
import { Collapsible, Content, Trigger } from "@radix-ui/react-collapsible";
import { api, mensajeError } from "../api/client";
import type { Convocatoria, Evento, TipoEvento } from "../api/types";
import { Badge, Button, Input, Sheet, Toast } from "./ui";

const TIPOS: Array<{ tipo: TipoEvento; txt: string }> = [
  { tipo: "gol", txt: "GOL" },
  { tipo: "autogol", txt: "AUTOGOL" },
  { tipo: "penal", txt: "PENAL" },
];

interface Props {
  partidoId: string;
  convocatorias: Convocatoria[];
  eventos: Evento[];
  nombreJugador: (id: string) => string;
  nombreEquipo: (id: string) => string;
  onCambio: () => void;
}

/**
 * Carga de goles en 2 taps: jugador -> tipo. Sin confirmación;
 * deshacer vía toast, corrección por jugador y cronología colapsable.
 */
export function CargaVivo({ partidoId, convocatorias, eventos, nombreJugador, nombreEquipo, onCambio }: Props): JSX.Element {
  type Hoja =
    | { modo: "agregar"; jugadorId: string; equipoId: string }
    | { modo: "quitar"; jugadorId: string };
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [cronoAbierta, setCronoAbierta] = useState(false);
  const [minuto, setMinuto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [tipoGol, setTipoGol] = useState<TipoEvento | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [deshacerId, setDeshacerId] = useState<string | null>(null);

  const presentes = convocatorias.filter((c) => c.estado === "convocado");
  const porEquipo = new Map<string, typeof presentes>();
  for (const c of presentes) {
    porEquipo.set(c.equipoId, [...(porEquipo.get(c.equipoId) ?? []), c]);
  }

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

  async function registrar(tipo: TipoEvento): Promise<void> {
    if (!hoja || hoja.modo !== "agregar" || enviando) return;
    setTipoGol(tipo);
    setEnviando(true);
    setError(null);
    try {
      const min = minuto.trim() === "" ? null : Number(minuto);
      const ev = await api.post<Evento>(`/partidos/${partidoId}/eventos`, {
        jugadorId: hoja.jugadorId,
        equipoId: hoja.equipoId,
        tipo,
        minuto: min,
      });
      setHoja(null);
      setMinuto("");
      setDeshacerId(ev.id);
      onCambio();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  async function borrar(id: string): Promise<void> {
    await api.del(`/eventos/${id}`);
    if (deshacerId === id) setDeshacerId(null);
    onCambio();
  }

  async function deshacer(): Promise<void> {
    if (!deshacerId) return;
    const id = deshacerId;
    setDeshacerId(null);
    await borrar(id);
  }

  const enCorreccion = hoja?.modo === "quitar";
  const eventosJugador = hoja?.modo === "quitar" ? eventos.filter((e) => e.jugadorId === hoja.jugadorId) : [];

  return (
    <div className="flex flex-col gap-3">
      {[...porEquipo.entries()].map(([equipoId, lista]) => (
        <div key={equipoId}>
          <h3 className="font-bold mb-1">{nombreEquipo(equipoId)}</h3>
          <div className="flex flex-col gap-1">
            {lista.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setHoja({ modo: "agregar", jugadorId: c.jugadorId, equipoId: c.equipoId });
                  }}
                  className="min-h-13 flex flex-1 items-center justify-between gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-3 text-left font-medium active:bg-emerald-50"
                >
                  <span className="min-w-0 break-words">{nombreJugador(c.jugadorId)}</span>
                  {textoConteos(c.jugadorId) ? (
                    <span className="shrink-0 text-sm font-normal text-stone-500">{textoConteos(c.jugadorId)}</span>
                  ) : null}
                </button>
                {tieneEventos(c.jugadorId) ? (
                  <button
                    type="button"
                    aria-label={`Quitar gol de ${nombreJugador(c.jugadorId)}`}
                    onClick={() => {
                      setError(null);
                      setHoja({ modo: "quitar", jugadorId: c.jugadorId });
                    }}
                    className="min-h-11 min-w-11 shrink-0 rounded-lg bg-white border border-stone-200 px-2 text-red-700 font-bold"
                  >
                    -
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
      {error ? <p className="text-red-700">{mensajeError(error)} (no se registró, reintenta)</p> : null}

      <Collapsible open={cronoAbierta} onOpenChange={setCronoAbierta}>
        <Trigger asChild>
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between font-bold"
          >
            <span>{`Cronología (${String(eventos.length)})`}</span>
            <span aria-hidden="true">{cronoAbierta ? "-" : "+"}</span>
          </button>
        </Trigger>
        <Content>
          {eventos.length === 0 ? (
            <p className="text-sm text-stone-500">Sin goles.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {[...eventos].reverse().map((e) => (
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
        </Content>
      </Collapsible>

      <Sheet
        open={hoja !== null}
        onOpenChange={(v) => { if (!v) setHoja(null); }}
        title={hoja ? (enCorreccion ? `Quitar gol de ${nombreJugador(hoja.jugadorId)}` : nombreJugador(hoja.jugadorId)) : ""}
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
        ) : (
          <div className="flex flex-col gap-2">
            {TIPOS.map((t) => (
              <Button key={t.tipo} disabled={enviando} onClick={() => void registrar(t.tipo)} className="min-h-14 text-lg">
                {enviando && t.tipo === tipoGol ? "Enviando..." : t.txt}
              </Button>
            ))}
            <Input
              aria-label="Minuto (opcional)"
              placeholder="Minuto (opcional)"
              inputMode="numeric"
              value={minuto}
              onChange={(e) => { setMinuto(e.target.value); }}
            />
          </div>
        )}
      </Sheet>

      {deshacerId ? <Toast texto="Gol registrado" accionTxt="Deshacer" onAccion={() => { void deshacer(); }} /> : null}
    </div>
  );
}
