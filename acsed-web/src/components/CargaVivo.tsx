import { useState, type JSX } from "react";
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
 * deshacer vía toast + borrado en lista reciente.
 */
export function CargaVivo({ partidoId, convocatorias, eventos, nombreJugador, nombreEquipo, onCambio }: Props): JSX.Element {
  const [sel, setSel] = useState<{ jugadorId: string; equipoId: string } | null>(null);
  const [minuto, setMinuto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [deshacerId, setDeshacerId] = useState<string | null>(null);

  const presentes = convocatorias.filter((c) => c.estado === "convocado");
  const porEquipo = new Map<string, typeof presentes>();
  for (const c of presentes) {
    porEquipo.set(c.equipoId, [...(porEquipo.get(c.equipoId) ?? []), c]);
  }

  async function registrar(tipo: TipoEvento): Promise<void> {
    if (!sel || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const min = minuto.trim() === "" ? null : Number(minuto);
      const ev = await api.post<Evento>(`/partidos/${partidoId}/eventos`, {
        jugadorId: sel.jugadorId,
        equipoId: sel.equipoId,
        tipo,
        minuto: min,
      });
      setSel(null);
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

  return (
    <div className="flex flex-col gap-3">
      {[...porEquipo.entries()].map(([equipoId, lista]) => (
        <div key={equipoId}>
          <h3 className="font-bold mb-1">{nombreEquipo(equipoId)}</h3>
          <div className="flex flex-col gap-1">
            {lista.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setError(null);
                  setSel({ jugadorId: c.jugadorId, equipoId: c.equipoId });
                }}
                className="min-h-[52px] px-3 rounded-lg bg-white border border-stone-200 text-left font-medium active:bg-emerald-50"
              >
                {nombreJugador(c.jugadorId)}
              </button>
            ))}
          </div>
        </div>
      ))}
      {error ? <p className="text-red-700">{mensajeError(error)} (no se registró, reintenta)</p> : null}

      <div>
        <h3 className="font-bold mb-1">Goles</h3>
        {eventos.length === 0 ? (
          <p className="text-sm text-stone-500">Sin goles.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {[...eventos].reverse().map((e) => (
              <li key={e.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 min-h-[44px]">
                <span className="text-sm">
                  {nombreJugador(e.jugadorId)} · <Badge>{e.tipo}</Badge>
                </span>
                <button
                  type="button"
                  aria-label={`Borrar gol de ${nombreJugador(e.jugadorId)}`}
                  onClick={() => void borrar(e.id)}
                  className="min-h-[44px] px-2 text-red-700 font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={sel !== null} onOpenChange={(v) => { if (!v) setSel(null); }} title={sel ? nombreJugador(sel.jugadorId) : ""}>
        <div className="flex flex-col gap-2">
          {TIPOS.map((t) => (
            <Button key={t.tipo} disabled={enviando} onClick={() => void registrar(t.tipo)} className="min-h-[56px] text-lg">
              {enviando ? "Enviando..." : t.txt}
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
      </Sheet>

      {deshacerId ? <Toast texto="Gol registrado" accionTxt="Deshacer" onAccion={() => { void deshacer(); }} /> : null}
    </div>
  );
}
