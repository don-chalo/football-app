import { useState, type FormEvent, type JSX } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { mensajeError } from "../api/client";
import { services } from "../api/services";
import type { BulkResult } from "../api/types";
import { useSession } from "../auth/Session";
import { Button, Card, Empty, ErrorMsg, Input, Loading, Title } from "../components/ui";
import { usePolling } from "../hooks/usePolling";
import { Tab } from "../components/Tab";

type Tab = "ligas" | "equipos" | "jugadores" | "usuarios";

export function GestionPage(): JSX.Element {
  const { esSistema } = useSession();
  const [tab, setTab] = useState<Tab>("ligas");
  return (
    <div className="flex flex-col gap-2">
      <Title>
        <h1 className="text-xl font-bold">GESTIÓN DE LIGAS/EQUIPOS/JUGADORES</h1>
      </Title>
      <Tabs.Tabs defaultValue="ligas" onValueChange={(v) => { setTab(v as Tab); }}>
        <Tabs.List className="w-full flex justify-around mb-2">
          <Tab value="ligas" label="Ligas" selected={tab === "ligas"} />
          <Tab value="equipos" label="Equipos" selected={tab === "equipos"} />
          <Tab value="jugadores" label="Jugadores" selected={tab === "jugadores"} />
          {esSistema ? <Tab value="usuarios" label="Usuarios" selected={tab === "usuarios"} /> : null}
        </Tabs.List>
        <Tabs.Content value="ligas">
          <LigasTab />
        </Tabs.Content>
        <Tabs.Content value="equipos">
          <NombresTab titulo="Equipo" />
        </Tabs.Content>
        <Tabs.Content value="jugadores">
          <JugadoresTab />
        </Tabs.Content>
        {esSistema ? (
          <Tabs.Content value="usuarios">
            <UsuariosTab />
          </Tabs.Content>
        ) : null}
      </Tabs.Tabs>
    </div>
  );
}

function LigasTab(): JSX.Element {
  const ligas = usePolling(() => services.ligas.listar(), 30_000);
  const { agregarLiga, quitarLiga } = useSession();
  const [nombre, setNombre] = useState("");
  const [formato, setFormato] = useState<"liga" | "copa">("liga");
  const [idaVuelta, setIdaVuelta] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function crear(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      const creada = await services.ligas.crear({ nombre: nombre.trim(), formato, idaVuelta: formato === "copa" && idaVuelta });
      agregarLiga(creada.id);
      setNombre("");
      ligas.refresh();
    } catch (err) {
      setError(err);
    }
  }

  async function borrar(id: string): Promise<void> {
    setError(null);
    try {
      await services.ligas.borrar(id);
      quitarLiga(id);
      ligas.refresh();
    } catch (err) {
      setError(err);
    }
  }

  if (ligas.loading && !ligas.data) return <Loading />;
  if (ligas.error && !ligas.data) return <ErrorMsg error={ligas.error} onRetry={ligas.refresh} />;
  return (
    <Card>
      <form onSubmit={(e) => { void crear(e); }} className="flex flex-col gap-2 mb-3">
        <Input aria-label="Nombre de liga" placeholder="Nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); }} />
        <div className="flex gap-2">
          <select aria-label="Formato" className="flex-1 min-h-11 rounded-lg border px-2 bg-white" value={formato} onChange={(e) => { setFormato(e.target.value as "liga" | "copa"); }}>
            <option value="liga">Liga</option>
            <option value="copa">Copa</option>
          </select>
          {formato === "copa" ? (
            <label className="flex items-center gap-2 min-h-11">
              <input type="checkbox" checked={idaVuelta} onChange={(e) => { setIdaVuelta(e.target.checked); }} className="w-5 h-5" />
              Ida+vuelta
            </label>
          ) : null}
        </div>
        {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
        <Button disabled={!nombre.trim()}>Crear liga</Button>
      </form>
      {(ligas.data ?? []).map((l) => (
        <div key={l.id} className="flex items-center justify-between border-t border-stone-100 min-h-11">
          <span>{l.nombre} <span className="text-xs text-stone-500">({l.formato})</span></span>
          <button type="button" onClick={() => void borrar(l.id)} className="min-h-11 px-2 text-red-700" aria-label={`Borrar ${l.nombre}`}>
            Borrar
          </button>
        </div>
      ))}
    </Card>
  );
}

function NombresTab({ titulo }: { titulo: string }): JSX.Element {
  const lista = usePolling(() => services.equipos.listar(), 30_000);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<unknown>(null);

  async function crear(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await services.equipos.crear(nombre.trim());
      setNombre("");
      lista.refresh();
    } catch (err) {
      setError(err);
    }
  }

  async function borrar(id: string): Promise<void> {
    setError(null);
    try {
      await services.equipos.borrar(id);
      lista.refresh();
    } catch (err) {
      setError(err);
    }
  }

  if (lista.loading && !lista.data) return <Loading />;
  if (lista.error && !lista.data) return <ErrorMsg error={lista.error} onRetry={lista.refresh} />;
  return (
    <Card>
      <form onSubmit={(e) => { void crear(e); }} className="flex gap-2 mb-3">
        <Input aria-label={`Nombre de ${titulo}`} placeholder={titulo} value={nombre} onChange={(e) => { setNombre(e.target.value); }} />
        <Button disabled={!nombre.trim()}>+</Button>
      </form>
      {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
      {(lista.data ?? []).map((x) => (
        <div key={x.id} className="flex items-center justify-between border-t border-stone-100 min-h-11">
          <span>{x.nombre}</span>
          <button type="button" onClick={() => void borrar(x.id)} className="min-h-11 px-2 text-red-700" aria-label={`Borrar ${x.nombre}`}>
            Borrar
          </button>
        </div>
      ))}
      {(lista.data ?? []).length === 0 ? <Empty texto="Vacío." /> : null}
    </Card>
  );
}

function JugadoresTab(): JSX.Element {
  const lista = usePolling(() => services.jugadores.listar(), 30_000);
  const [masivo, setMasivo] = useState("");
  const [resultado, setResultado] = useState<BulkResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  async function bulk(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setResultado(null);
    const nombres = masivo.split("\n").map((s) => s.trim()).filter(Boolean);
    if (nombres.length === 0) return;
    try {
      const r = await services.jugadores.crearVarios(nombres);
      setResultado(r);
      setMasivo("");
      lista.refresh();
    } catch (err) {
      setError(err);
    }
  }

  async function borrar(id: string): Promise<void> {
    setError(null);
    try {
      await services.jugadores.borrar(id);
      lista.refresh();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="font-bold mb-2">Alta masiva (uno por línea)</h2>
        <form onSubmit={(e) => { void bulk(e); }} className="flex flex-col gap-2">
          <textarea aria-label="Nombres" rows={4} className="rounded-lg border border-cancha-950/20 p-2" value={masivo} onChange={(e) => { setMasivo(e.target.value); }} />
          {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
          {resultado ? (
            <p className="text-sm">
              Creados: {resultado.creados.length}. Errores: {resultado.errores.map((x) => `${x.nombre} (${x.motivo})`).join(", ") || "—"}
            </p>
          ) : null}
          <Button>Crear varios</Button>
        </form>
      </Card>
      <Card>
        {lista.loading && !lista.data ? <Loading /> : null}
        {lista.error && !lista.data ? <ErrorMsg error={lista.error} onRetry={lista.refresh} /> : null}
        {(lista.data ?? []).map((j) => (
          <div key={j.id} className="flex items-center justify-between border-t border-stone-100 min-h-11">
            <span>{j.nombre}</span>
            <button type="button" onClick={() => void borrar(j.id)} className="min-h-11 px-2 text-red-700" aria-label={`Borrar ${j.nombre}`}>
              Borrar
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function UsuariosTab(): JSX.Element {
  const users = usePolling(() => services.usuarios.listar(), 30_000);
  const ligas = usePolling(() => services.ligas.listar(), 30_000);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin_partidos" | "admin_usuarios">("admin_partidos");
  const [error, setError] = useState<unknown>(null);
  const [ligaSel, setLigaSel] = useState("");
  const [asignarId, setAsignarId] = useState("");
  const asignados = usePolling(
    () => (ligaSel ? services.asignaciones.porLiga(ligaSel) : Promise.resolve([])),
    30_000,
    ligaSel !== "",
  );

  async function crear(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await services.usuarios.crear({ username: username.trim(), password, role });
      setUsername("");
      setPassword("");
      users.refresh();
    } catch (err) {
      setError(err);
    }
  }

  async function asignar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!ligaSel || !asignarId) return;
    setError(null);
    try {
      await services.asignaciones.asignar(ligaSel, asignarId);
      asignados.refresh();
    } catch (err) {
      setError(err);
    }
  }

  async function quitar(userId: string): Promise<void> {
    if (!ligaSel) return;
    setError(null);
    try {
      await services.asignaciones.quitar(ligaSel, userId);
      asignados.refresh();
    } catch (err) {
      setError(err);
    }
  }

  const nombreUsuario = (id: string): string => (users.data ?? []).find((u) => u.id === id)?.username ?? id;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="font-bold mb-2">Nuevo usuario</h2>
        <form onSubmit={(e) => { void crear(e); }} className="flex flex-col gap-2">
          <Input aria-label="Usuario" placeholder="Usuario" value={username} onChange={(e) => { setUsername(e.target.value); }} />
          <Input aria-label="Contraseña" placeholder="Contraseña (mín. 4)" type="password" value={password} onChange={(e) => { setPassword(e.target.value); }} />
          <select aria-label="Rol" className="min-h-11 rounded-lg border px-2 bg-white" value={role} onChange={(e) => { setRole(e.target.value as typeof role); }}>
            <option value="admin_partidos">Admin de partidos</option>
            <option value="admin_usuarios">Admin de sistema</option>
          </select>
          {error ? <p className="text-red-700">{mensajeError(error)}</p> : null}
          <Button disabled={!username.trim() || password.length < 4}>Crear</Button>
        </form>
        {(users.data ?? []).map((u) => (
          <div key={u.id} className="border-t border-stone-100 min-h-11 flex items-center justify-between">
            <span>{u.username} <span className="text-xs text-stone-500">({u.role})</span></span>
          </div>
        ))}
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Asignar a liga</h2>
        <form onSubmit={(e) => { void asignar(e); }} className="flex flex-col gap-2">
          <select aria-label="Liga" className="min-h-11 rounded-lg border px-2 bg-white" value={ligaSel} onChange={(e) => { setLigaSel(e.target.value); }}>
            <option value="">Liga...</option>
            {(ligas.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
          <select aria-label="Admin" className="min-h-11 rounded-lg border px-2 bg-white" value={asignarId} onChange={(e) => { setAsignarId(e.target.value); }}>
            <option value="">Admin de partidos...</option>
            {(users.data ?? []).filter((u) => u.role === "admin_partidos").map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
          <Button disabled={!ligaSel || !asignarId}>Asignar</Button>
        </form>
        {(asignados.data ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between border-t border-stone-100 min-h-11">
            <span>{nombreUsuario(a.userId)}</span>
            <button type="button" onClick={() => void quitar(a.userId)} className="min-h-11 px-2 text-red-700">
              Quitar
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
