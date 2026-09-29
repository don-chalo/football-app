import type { JSX } from "react";
import { Link } from "react-router-dom";
import { Card, Empty } from "../components/ui";

export function HomePage(): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h1 className="text-xl font-bold">Ligas barriales</h1>
        <p className="text-stone-600">Consulta ligas, partidos y estadísticas.</p>
        <Link className="inline-block mt-3 underline min-h-11" to="/ligas">
          Ver ligas
        </Link>
      </Card>
      <Empty texto="Contenido público en construcción (ola 1)." />
    </div>
  );
}

export function NotFound(): JSX.Element {
  return (
    <Card>
      <h1 className="text-xl font-bold">No encontrado</h1>
      <Link className="underline" to="/">
        Volver al inicio
      </Link>
    </Card>
  );
}
