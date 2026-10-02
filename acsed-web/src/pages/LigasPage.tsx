import type { JSX } from "react";
import { Link } from "react-router-dom";
import { services } from "../api/services";
import { Badge, Card, Empty, ErrorMsg, Loading, Title } from "../components/ui";
import { usePolling } from "../hooks/usePolling";

export function LigasPage(): JSX.Element {
  const { data, error, loading, refresh } = usePolling(() => services.ligas.listar(), 30_000);
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorMsg error={error} onRetry={refresh} />;
  if (!data || data.length === 0) return <Empty texto="Sin ligas todavía." />;
  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">LIGAS/COPAS</h1>
      </Title>
      {data.map((l) => (
        <Link key={l.id} to={`/ligas/${l.id}`}>
          <Card>
            <div className="flex items-center justify-between min-h-11">
              <span className="font-bold">{l.nombre}</span>
              <Badge>{l.formato === "liga" ? `Liga${l.idaVuelta ? " ida/vuelta" : ""}` : `Copa${l.idaVuelta ? " ida+vuelta" : ""}`}</Badge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
