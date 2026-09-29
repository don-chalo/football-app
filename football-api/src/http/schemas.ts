import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Id invalido");
export const nombre = z.string().trim().min(1, "Nombre requerido").max(120);

export const roleSchema = z.enum(["admin_partidos", "admin_usuarios"]);
export const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export const userCreateSchema = z.object({
  username: nombre,
  password: z.string().min(4, "Minimo 4 caracteres"),
  role: roleSchema,
});
export const userPatchSchema = z.object({
  username: nombre.optional(),
  password: z.string().min(4).optional(),
  role: roleSchema.optional(),
});

export const ligaSchema = z.object({
  nombre: nombre,
  formato: z.enum(["liga", "copa"]),
  idaVuelta: z.boolean().optional(),
});
export const ligaPatchSchema = ligaSchema.partial();

export const nombreSchema = z.object({ nombre });

export const partidoCreateSchema = z.object({
  ligaId: objectId,
  localId: objectId,
  visitaId: objectId,
  fecha: z.string().datetime({ offset: true }),
  fase: z.string().max(120).optional(),
  idaDe: objectId.nullable().optional(),
});
export const partidoPatchSchema = z.object({
  fecha: z.string().datetime({ offset: true }).optional(),
  fase: z.string().max(120).optional(),
  idaDe: objectId.nullable().optional(),
  penalesLocal: z.number().int().min(0).nullable().optional(),
  penalesVisita: z.number().int().min(0).nullable().optional(),
  clasificadoId: objectId.nullable().optional(),
});
export const estadoSchema = z.object({ estado: z.enum(["programado", "en_juego", "finalizado"]) });

export const convocatoriaSchema = z.object({ jugadorId: objectId, equipoId: objectId });
export const convocatoriaPatchSchema = z.object({ estado: z.enum(["convocado", "ausente"]) });

export const eventoSchema = z.object({
  jugadorId: objectId,
  equipoId: objectId,
  tipo: z.enum(["gol", "autogol", "penal"]),
  minuto: z.number().int().min(0).nullable().optional(),
  metadata: z.unknown().optional(),
});
export const eventoPatchSchema = eventoSchema.partial();
