import type { JSX } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Liga } from "../api/types";
import { useSession } from "../auth/Session";
import { Badge, Card, Empty, ErrorMsg, Loading, Title } from "../components/ui";
import { usePolling } from "../hooks/usePolling";

export function AdminHomePage(): JSX.Element {
  const { user, misLigas, esSistema } = useSession();
  const ligas = usePolling(() => api.get<Liga[]>("/ligas"), 15_000);
  if (ligas.loading && !ligas.data) return <Loading />;
  if (ligas.error && !ligas.data) return <ErrorMsg error={ligas.error} onRetry={ligas.refresh} />;
  const visibles = (ligas.data ?? []).filter((l) => esSistema || misLigas.includes(l.id));

  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">HOLA, {user?.username.toUpperCase()}</h1>
        <p className="text-sm text-stone-500 content-center"> [{esSistema ? "Admin de sistema" : "Admin de partidos"}]</p>
      </Title>
      <Link to="/admin/gestion">
        <Card>
          <span className="font-bold min-h-11 flex items-center">Gestión (ligas, equipos, jugadores{esSistema ? ", usuarios" : ""})</span>
        </Card>
      </Link>
      {visibles.length === 0 ? (
        <Empty texto="Sin ligas asignadas todavía. Pide a un admin de sistema que te asigne." />
      ) : (
        visibles.map((l) => (
          <Link key={l.id} to={`/admin/ligas/${l.id}`}>
            <Card>
              {/* <span className="font-bold min-h-11 flex items-center">{l.nombre}</span> */}
              <div className="flex items-center justify-between min-h-11">
                <span className="font-bold">{l.nombre}</span>
                <Badge>{l.formato === "liga" ? `Liga${l.idaVuelta ? " ida/vuelta" : ""}` : `Copa${l.idaVuelta ? " ida+vuelta" : ""}`}</Badge>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
