import { Badge, Card } from "./ui";

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
  return <Card>
    <div className="min-h-11 flex flex-wrap justify-between gap-x-3 gap-y-1">
      <span className="min-w-0 flex-1 font-medium wrap-break-words pt-2">
        {`${partido.mapaEquipos.get(partido.localId) ?? "?"} ${String(partido.marcador.local)} - ${String(partido.marcador.visita)} ${partido.mapaEquipos.get(partido.visitaId) ?? "?"}`}
      </span>
      <div className="text-sm text-stone-500 flex items-center justify-between min-h-11">
        {partido.fase && <span>{partido.fase || "—"}</span>}
        <span className="p-2 h-min">{partido.fecha.slice(0, 10) || "—"}</span>
        <Badge>{partido.estado}</Badge>
      </div>
    </div>
  </Card>;
}