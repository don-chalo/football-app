import { badRequest, conflict, notFound, unauthorized } from "../http/errors";
import { signToken } from "../http/middleware/auth";
import { uniqueKey } from "../domain/normalize";
import type { MongooseAsignacionesRepo } from "../repositories/asignaciones.repository";
import type { MongooseLigasRepo } from "../repositories/catalogos.repository";
import type { MongooseUsersRepo } from "../repositories/users.repository";
import type { Role } from "../http/middleware/auth";

export interface PublicUser {
  id: string;
  username: string;
  role: Role;
}

export function toPublic(u: { id: string; username: string; role: Role }): PublicUser {
  return { id: u.id, username: u.username, role: u.role };
}

export function isDuplicateError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000;
}

export interface Hasher {
  hash(p: string): Promise<string>;
  compare(p: string, h: string): Promise<boolean>;
}

export function createAuthService(
  users: MongooseUsersRepo,
  hasher: Hasher,
  extra?: {
    asignaciones?: Pick<MongooseAsignacionesRepo, "listByUser">;
    ligas?: Pick<MongooseLigasRepo, "list">;
  },
) {
  return {
    async login(username: string, password: string): Promise<{ token: string; user: PublicUser; misLigas: string[] }> {
      const user = await users.findByUsername(username);
      if (!user || !(await hasher.compare(password, user.passwordHash))) {
        throw unauthorized("Credenciales invalidas");
      }
      let misLigas: string[] = [];
      if (extra?.asignaciones && extra.ligas) {
        misLigas =
          user.role === "admin_usuarios"
            ? (await extra.ligas.list()).map((l) => l.id)
            : (await extra.asignaciones.listByUser(user.id)).map((a) => a.ligaId);
      }
      return { token: signToken({ sub: user.id, role: user.role }), user: toPublic(user), misLigas };
    },
  };
}

export function createUsersService(users: MongooseUsersRepo, hasher: Hasher) {
  async function create(data: { username: string; password: string; role: Role }): Promise<PublicUser> {
    const username = data.username.trim();
    if (!username) throw badRequest("Nombre de usuario requerido");
    if (await users.findByUsername(username)) throw conflict("Nombre de usuario en uso");
    try {
      const created = await users.create({ username, passwordHash: await hasher.hash(data.password), role: data.role });
      return toPublic(created);
    } catch (err) {
      if (isDuplicateError(err)) throw conflict("Nombre de usuario en uso");
      throw err;
    }
  }

  return {
    create,
    async list(): Promise<PublicUser[]> {
      return (await users.list()).map(toPublic);
    },
    async get(id: string): Promise<PublicUser> {
      const u = await users.findById(id);
      if (!u) throw notFound("Usuario");
      return toPublic(u);
    },
    async update(id: string, data: { username?: string; password?: string; role?: Role }): Promise<PublicUser> {
      const current = await users.findById(id);
      if (!current) throw notFound("Usuario");
      if (data.username !== undefined && uniqueKey(data.username) !== uniqueKey(current.username)) {
        if (await users.findByUsername(data.username)) throw conflict("Nombre de usuario en uso");
      }
      const patch: { username?: string; passwordHash?: string; role?: Role } = {};
      if (data.username !== undefined) {
        if (!data.username.trim()) throw badRequest("Nombre de usuario requerido");
        patch.username = data.username;
      }
      if (data.password !== undefined) patch.passwordHash = await hasher.hash(data.password);
      if (data.role !== undefined) patch.role = data.role;
      try {
        const updated = await users.update(id, patch);
        if (!updated) throw notFound("Usuario");
        return toPublic(updated);
      } catch (err) {
        if (isDuplicateError(err)) throw conflict("Nombre de usuario en uso");
        throw err;
      }
    },
    async remove(id: string): Promise<void> {
      if (!(await users.remove(id))) throw notFound("Usuario");
    },
  };
}
