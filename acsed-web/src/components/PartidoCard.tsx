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
  return <Card className={partido.estado === "suspendido" ? "opacity-60" : ""}>
    <div className="grid grid-cols-2 gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex align-middle">
          <span className="min-w-0 font-medium wrap-break-words pt-2">
            {`${partido.mapaEquipos.get(partido.localId) ?? "?"} ${String(partido.marcador.local)} - ${String(partido.marcador.visita)} ${partido.mapaEquipos.get(partido.visitaId) ?? "?"}`}
          </span>
        </div>
        <div className="flex align-middle">
          <span className="min-w-0 font-normal wrap-break-words pt-2">
            {partido.penalesLocal !== null && partido.penalesVisita !== null ? ` (Penales: ${String(partido.penalesLocal)}-${String(partido.penalesVisita)})` : ""}
          </span>
        </div>
      </div>
      <div className="text-sm text-neutral-600 flex items-center justify-end min-h-11">
        {partido.fase && <span>{partido.fase || "—"}</span>}
        <span className="p-2 h-min md:text-sm text-xs">{partido.fecha.slice(0, 10) || "—"}</span>
        <Badge tono={tonoPorEstado(partido.estado)} pulso={partido.estado === "en_juego"}>{partido.estado}</Badge>
      </div>
    </div>
  </Card>;
}