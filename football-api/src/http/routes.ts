import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { asyncHandler } from "./middleware/errors";
import { requireAdmin, requireUserAdmin } from "./middleware/auth";
import {
  attachActor,
  ligaFromBody,
  ligaFromConvocatoria,
  ligaFromEvento,
  ligaFromParams,
  ligaFromPartidoParam,
  requireLigaAccess,
  type ScopeDeps,
} from "./middleware/scope";
import { estadoSchema, pausaSchema, eventoPatchSchema, eventoSchema, convocatoriaPatchSchema, convocatoriaSchema, ligaPatchSchema, ligaSchema, loginSchema, nombreSchema, objectId, partidoCreateSchema, partidoPatchSchema, userCreateSchema, userPatchSchema } from "./schemas";
import type { Services } from "./services";
import type { Actor, Role } from "../repositories/types";

const idParam = z.object({ id: z.string() });
const partidoParam = z.object({ partidoId: z.string() });
const asignarSchema = z.object({ userId: objectId });

function parseId(raw: string): string {
  return objectId.parse(raw);
}

function actorOf(req: Request): (Actor & { role: Role }) | undefined {
  if (!req.actor || !req.auth) return undefined;
  return { userId: req.actor.userId, username: req.actor.username, role: req.auth.role };
}

function soloActor(req: Request): Actor | undefined {
  const a = actorOf(req);
  return a ? { userId: a.userId, username: a.username } : undefined;
}

export interface RouterDeps extends ScopeDeps {
  users: Parameters<typeof attachActor>[0];
}

export function buildRouter(s: Services, deps: RouterDeps): Router {
  const r = Router();
  const scope = (resolve: (req: Request) => Promise<string | null>) =>
    [requireAdmin, requireLigaAccess(deps, resolve)] as const;
  const conActor = attachActor(deps.users);

  r.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // ---- auth (publico) ----
  r.post("/auth/login", asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const out = await s.auth.login(body.username, body.password);
    res.json(out);
  }));

  // ---- usuarios (solo admin_usuarios) ----
  r.get("/usuarios", requireAdmin, requireUserAdmin, asyncHandler(async (_req, res) => {
    res.json(await s.users.list());
  }));
  r.post("/usuarios", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    const body = userCreateSchema.parse(req.body);
    res.status(201).json(await s.users.create(body));
  }));
  r.get("/usuarios/:id", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    res.json(await s.users.get(parseId(idParam.parse(req.params).id)));
  }));
  r.put("/usuarios/:id", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    const body = userCreateSchema.parse(req.body);
    res.json(await s.users.update(parseId(idParam.parse(req.params).id), body));
  }));
  r.patch("/usuarios/:id", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    const body = userPatchSchema.parse(req.body);
    res.json(await s.users.update(parseId(idParam.parse(req.params).id), body));
  }));
  r.delete("/usuarios/:id", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    await s.users.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- ligas ----
  r.get("/ligas", asyncHandler(async (_req, res) => {
    res.json(await s.ligas.list());
  }));
  r.post("/ligas", requireAdmin, conActor, asyncHandler(async (req, res) => {
    res.status(201).json(await s.ligas.create(ligaSchema.parse(req.body), actorOf(req)));
  }));
  r.get("/ligas/:id", asyncHandler(async (req, res) => {
    res.json(await s.ligas.get(parseId(idParam.parse(req.params).id)));
  }));
  r.put("/ligas/:id", ...scope(ligaFromParams()), asyncHandler(async (req, res) => {
    const body = ligaSchema.parse(req.body);
    res.json(await s.ligas.update(parseId(idParam.parse(req.params).id), body));
  }));
  r.patch("/ligas/:id", ...scope(ligaFromParams()), asyncHandler(async (req, res) => {
    const body = ligaPatchSchema.parse(req.body);
    res.json(await s.ligas.update(parseId(idParam.parse(req.params).id), body));
  }));
  r.delete("/ligas/:id", ...scope(ligaFromParams()), asyncHandler(async (req, res) => {
    await s.ligas.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- admins por liga (solo admin_usuarios) ----
  r.get("/ligas/:id/admins", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    await s.ligas.get(parseId(idParam.parse(req.params).id));
    res.json(await s.asignaciones.listByLiga(parseId(idParam.parse(req.params).id)));
  }));
  r.post("/ligas/:id/admins", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    const body = asignarSchema.parse(req.body);
    const ligaId = parseId(idParam.parse(req.params).id);
    res.status(201).json(await s.asignaciones.asignar(parseId(body.userId), ligaId));
  }));
  r.delete("/ligas/:id/admins/:userId", requireAdmin, requireUserAdmin, asyncHandler(async (req, res) => {
    const ligaId = parseId(idParam.parse(req.params).id);
    const userId = parseId(z.object({ userId: z.string() }).parse(req.params).userId);
    await s.asignaciones.quitar(userId, ligaId);
    res.status(204).end();
  }));

  // ---- equipos (globales, sin scope) ----
  r.get("/equipos", asyncHandler(async (_req, res) => {
    res.json(await s.equipos.list());
  }));
  r.post("/equipos", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.parse(req.body);
    res.status(201).json(await s.equipos.create(body.nombre));
  }));
  r.get("/equipos/:id", asyncHandler(async (req, res) => {
    res.json(await s.equipos.get(parseId(idParam.parse(req.params).id)));
  }));
  r.put("/equipos/:id", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.parse(req.body);
    res.json(await s.equipos.update(parseId(idParam.parse(req.params).id), body.nombre));
  }));
  r.patch("/equipos/:id", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.partial().parse(req.body);
    if (body.nombre === undefined) {
      res.status(422).json({ code: "UNPROCESSABLE", message: "Nombre requerido" });
      return;
    }
    res.json(await s.equipos.update(parseId(idParam.parse(req.params).id), body.nombre));
  }));
  r.delete("/equipos/:id", requireAdmin, asyncHandler(async (req, res) => {
    await s.equipos.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- jugadores (globales, sin scope) ----
  r.get("/jugadores", asyncHandler(async (_req, res) => {
    res.json(await s.jugadores.list());
  }));
  r.post("/jugadores/bulk", requireAdmin, asyncHandler(async (req, res) => {
    const body = z.object({ nombres: z.array(z.string()).min(1).max(500) }).parse(req.body);
    res.status(201).json(await s.jugadores.bulk(body.nombres));
  }));
  r.post("/jugadores", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.parse(req.body);
    res.status(201).json(await s.jugadores.create(body.nombre));
  }));
  r.get("/jugadores/:id", asyncHandler(async (req, res) => {
    res.json(await s.jugadores.get(parseId(idParam.parse(req.params).id)));
  }));
  r.put("/jugadores/:id", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.parse(req.body);
    res.json(await s.jugadores.update(parseId(idParam.parse(req.params).id), body.nombre));
  }));
  r.patch("/jugadores/:id", requireAdmin, asyncHandler(async (req, res) => {
    const body = nombreSchema.partial().parse(req.body);
    if (body.nombre === undefined) {
      res.status(422).json({ code: "UNPROCESSABLE", message: "Nombre requerido" });
      return;
    }
    res.json(await s.jugadores.update(parseId(idParam.parse(req.params).id), body.nombre));
  }));
  r.delete("/jugadores/:id", requireAdmin, asyncHandler(async (req, res) => {
    await s.jugadores.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- partidos (con scope por liga) ----
  r.get("/partidos", asyncHandler(async (req, res) => {
    const q = z.object({ ligaId: z.string().optional(), estado: z.enum(["programado", "en_juego", "finalizado", "suspendido"]).optional() }).parse(req.query);
    res.json(await s.partidos.list({
      ligaId: q.ligaId ? parseId(q.ligaId) : undefined,
      estado: q.estado,
    }));
  }));
  r.post("/partidos", ...scope(ligaFromBody()), conActor, asyncHandler(async (req, res) => {
    res.status(201).json(await s.partidos.create(partidoCreateSchema.parse(req.body), soloActor(req)));
  }));
  r.get("/partidos/:id", asyncHandler(async (req, res) => {
    res.json(await s.partidos.detalle(parseId(idParam.parse(req.params).id)));
  }));
  r.put("/partidos/:id", ...scope(ligaFromPartidoParam(deps, "id")), asyncHandler(async (req, res) => {
    const body = partidoPatchSchema.parse(req.body);
    res.json(await s.partidos.actualizar(parseId(idParam.parse(req.params).id), body, { full: true }));
  }));
  r.patch("/partidos/:id", ...scope(ligaFromPartidoParam(deps, "id")), asyncHandler(async (req, res) => {
    const body = partidoPatchSchema.parse(req.body);
    res.json(await s.partidos.actualizar(parseId(idParam.parse(req.params).id), body));
  }));
  r.patch("/partidos/:id/estado", ...scope(ligaFromPartidoParam(deps, "id")), asyncHandler(async (req, res) => {
    const body = estadoSchema.parse(req.body);
    res.json(await s.partidos.cambiarEstado(parseId(idParam.parse(req.params).id), body.estado));
  }));
  r.post("/partidos/:id/pausa", ...scope(ligaFromPartidoParam(deps, "id")), asyncHandler(async (req, res) => {
    const body = pausaSchema.parse(req.body);
    res.json(await s.partidos.pausa(parseId(idParam.parse(req.params).id), body.pausada));
  }));
  r.delete("/partidos/:id", ...scope(ligaFromPartidoParam(deps, "id")), asyncHandler(async (req, res) => {
    await s.partidos.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- convocatorias ----
  r.get("/partidos/:partidoId/convocatorias", asyncHandler(async (req, res) => {
    res.json(await s.convocatorias.list(parseId(partidoParam.parse(req.params).partidoId)));
  }));
  r.post("/partidos/:partidoId/convocatorias", ...scope(ligaFromPartidoParam(deps)), conActor, asyncHandler(async (req, res) => {
    const body = convocatoriaSchema.parse(req.body);
    const pid = parseId(partidoParam.parse(req.params).partidoId);
    res.status(201).json(await s.convocatorias.convocar(pid, parseId(body.jugadorId), parseId(body.equipoId), soloActor(req)));
  }));
  r.patch("/convocatorias/:id", ...scope(ligaFromConvocatoria(deps)), asyncHandler(async (req, res) => {
    const body = convocatoriaPatchSchema.parse(req.body);
    res.json(await s.convocatorias.marcar(parseId(idParam.parse(req.params).id), body.estado));
  }));
  r.delete("/convocatorias/:id", ...scope(ligaFromConvocatoria(deps)), asyncHandler(async (req, res) => {
    await s.convocatorias.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- eventos ----
  r.get("/partidos/:partidoId/eventos", asyncHandler(async (req, res) => {
    res.json(await s.eventos.list(parseId(partidoParam.parse(req.params).partidoId)));
  }));
  r.post("/partidos/:partidoId/eventos", ...scope(ligaFromPartidoParam(deps)), conActor, asyncHandler(async (req, res) => {
    const body = eventoSchema.parse(req.body);
    const pid = parseId(partidoParam.parse(req.params).partidoId);
    res.status(201).json(await s.eventos.registrar(pid, {
      jugadorId: parseId(body.jugadorId),
      equipoId: parseId(body.equipoId),
      tipo: body.tipo,
      minuto: body.minuto ?? null,
      metadata: body.metadata,
    }, soloActor(req)));
  }));
  r.patch("/eventos/:id", ...scope(ligaFromEvento(deps)), asyncHandler(async (req, res) => {
    const raw = eventoPatchSchema.parse(req.body);
    const { jugadorId, equipoId, ...rest } = raw;
    res.json(await s.eventos.actualizar(parseId(idParam.parse(req.params).id), {
      ...rest,
      ...(jugadorId !== undefined ? { jugadorId: parseId(jugadorId) } : {}),
      ...(equipoId !== undefined ? { equipoId: parseId(equipoId) } : {}),
    }));
  }));
  r.delete("/eventos/:id", ...scope(ligaFromEvento(deps)), asyncHandler(async (req, res) => {
    await s.eventos.remove(parseId(idParam.parse(req.params).id));
    res.status(204).end();
  }));

  // ---- estadisticas (publicas) ----
  r.get("/estadisticas/equipos", asyncHandler(async (req, res) => {
    const q = z.object({ liga_ids: z.string().optional(), desde: z.string().optional(), hasta: z.string().optional() }).parse(req.query);
    res.json(await s.estadisticas.equipos({ ligaIds: q.liga_ids?.split(","), desde: q.desde, hasta: q.hasta }));
  }));
  r.get("/estadisticas/jugadores", asyncHandler(async (req, res) => {
    const q = z.object({
      liga_ids: z.string().optional(), desde: z.string().optional(), hasta: z.string().optional(),
      equipo_id: z.string().optional(), partido_id: z.string().optional(),
    }).parse(req.query);
    res.json(await s.estadisticas.jugadores({
      ligaIds: q.liga_ids?.split(","),
      desde: q.desde,
      hasta: q.hasta,
      equipoId: q.equipo_id ? parseId(q.equipo_id) : undefined,
      partidoId: q.partido_id ? parseId(q.partido_id) : undefined,
    }));
  }));
  r.get("/estadisticas/enfrentamientos", asyncHandler(async (req, res) => {
    const q = z.object({
      equipo_a: z.string(), equipo_b: z.string(),
      liga_ids: z.string().optional(), desde: z.string().optional(), hasta: z.string().optional(),
    }).parse(req.query);
    res.json(await s.estadisticas.enfrentamientos({
      equipoA: parseId(q.equipo_a),
      equipoB: parseId(q.equipo_b),
      ligaIds: q.liga_ids?.split(","),
      desde: q.desde,
      hasta: q.hasta,
    }));
  }));

  return r;
}
