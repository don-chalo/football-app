import { Badge, Card, tonoPorEstado } from "./ui";

interface PartidoRowProps {
  id: string;
  localId: string;
  visitaId: string;
  fecha: string;
  estado: string;
  fase: string;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
  marcador: { local: number; visita: number };
  mapaEquipos: Map<string, string>;
}

export function PartidoCard(partido: PartidoRowProps) {
  const secundaria = [
    partido.fase || null,
    partido.fecha.slice(0, 10) || null,
    partido.penalesLocal !== null && partido.penalesVisita !== null
      ? `Penales ${String(partido.penalesLocal)}-${String(partido.penalesVisita)}`
      : null,
  ].filter((x) => x !== null).join(" · ");
  return <Card className={partido.estado === "suspendido" ? "opacity-60" : ""}>
    <div className="flex items-start justify-between gap-2 min-h-11">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate font-bold">{partido.mapaEquipos.get(partido.localId) ?? "?"}</span>
          <span className="text-2xl font-black tabular-nums">{partido.marcador.local}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate font-bold">{partido.mapaEquipos.get(partido.visitaId) ?? "?"}</span>
          <span className="text-2xl font-black tabular-nums">{partido.marcador.visita}</span>
        </div>
        <div className="flex items-baseline justify-start gap-2">
          {secundaria ? (
            <p className="text-xs text-neutral-600 mt-1">{secundaria}</p>
          ) : null}
          <Badge tono={tonoPorEstado(partido.estado)} pulso={partido.estado === "en_juego"}>{partido.estado}</Badge>
        </div>
      </div>
    </div>
  </Card>;
}
