import { useState, type FormEvent, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, mensajeError } from "../api/client";
import type { Equipo, Liga, PartidoDetalle } from "../api/types";
import { useSession } from "../auth/Session";
import { Button, Card, Input, Title } from "../components/ui";
import { usePolling } from "../hooks/usePolling";

export function PartidoFormPage(): JSX.Element {
  const { misLigas, esSistema } = useSession();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const ligaFija = params.get("ligaId") ?? "";
  const ligas = usePolling(() => api.get<Liga[]>("/ligas"), 60_000);
  const equipos = usePolling(() => api.get<Equipo[]>("/equipos"), 60_000);
  const [ligaId, setLigaId] = useState(ligaFija);
  const [localId, setLocalId] = useState("");
  const [visitaId, setVisitaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [fase, setFase] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  const ligasVisibles = (ligas.data ?? []).filter((l) => esSistema || misLigas.includes(l.id));
  const mismoEquipo = localId !== "" && localId === visitaId;

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (mismoEquipo || !ligaId || !localId || !visitaId || !fecha) return;
    setError(null);
    setEnviando(true);
    try {
      const p = await api.post<PartidoDetalle>("/partidos", {
        ligaId,
        localId,
        visitaId,
        fecha: new Date(fecha).toISOString(),
        fase,
      });
      nav(`/admin/partidos/${p.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">NUEVO PARTIDO</h1>
      </Title>
      <Card>
        <form onSubmit={(e) => { void onSubmit(e); }} className="flex flex-col gap-2">
          <select
            aria-label="Liga"
            className="min-h-11 rounded-lg border px-3 bg-white disabled:opacity-70"
            value={ligaId}
            disabled={ligaFija !== ""}
            onChange={(e) => { setLigaId(e.target.value); }}
          >
            <option value="">Liga...</option>
            {ligasVisibles.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
          <select aria-label="Local" className="min-h-11 rounded-lg border px-3 bg-white" value={localId} onChange={(e) => { setLocalId(e.target.value); }}>
            <option value="">Local...</option>
            {(equipos.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          <select aria-label="Visita" className="min-h-11 rounded-lg border px-3 bg-white" value={visitaId} onChange={(e) => { setVisitaId(e.target.value); }}>
            <option value="">Visita...</option>
            {(equipos.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          {mismoEquipo ? <p className="text-red-700">Local y visita deben ser distintos.</p> : null}
          <Input aria-label="Fecha y hora" type="datetime-local" value={fecha} onChange={(e) => { setFecha(e.target.value); }} />
          <Input aria-label="Fase (opcional)" placeholder="Fase (ej. fecha 1, semi)" value={fase} onChange={(e) => { setFase(e.target.value); }} />
          {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
          <Button disabled={enviando || mismoEquipo || !ligaId || !localId || !visitaId || !fecha}>
            {enviando ? "Creando..." : "Crear partido"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
