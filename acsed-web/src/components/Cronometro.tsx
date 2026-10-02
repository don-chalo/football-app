import { useState, type JSX } from "react";
import { mensajeError } from "../api/client";
import { services } from "../api/services";
import { useCronometro, type RelojPartido } from "../hooks/useCronometro";
import { Badge, Card } from "./ui";

export function Cronometro({ partido, onCambio }: { partido: RelojPartido & { id: string }; onCambio: () => void }): JSX.Element {
  const reloj = useCronometro(partido);
  const [error, setError] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  async function pausar(pausada: boolean): Promise<void> {
    setError(null);
    setEnviando(true);
    try {
      await services.partidos.pausa(partido.id, pausada);
      onCambio();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black tabular-nums" aria-label="Minuto de juego">{reloj.texto ?? "--:--"}</span>
          {reloj.pausado ? <Badge tono="neutro">PAUSADO</Badge> : <Badge tono="energia" pulso>EN JUEGO</Badge>}
        </div>
        <button
          type="button"
          disabled={enviando}
          onClick={() => void pausar(!reloj.pausado)}
          className="min-h-11 px-4 rounded-lg font-medium border border-cancha-600/40 text-cancha-700 disabled:opacity-50"
        >
          {reloj.pausado ? "Reanudar" : "Pausar"}
        </button>
      </div>
      {error ? <p className="text-red-700 text-sm mt-1">{mensajeError(error)}</p> : null}
    </Card>
  );
}
