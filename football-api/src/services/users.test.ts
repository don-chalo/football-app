import { beforeEach, describe, expect, it } from "vitest";
import { FakeUsers, resetIds } from "../testing/fakes";
import { createAuthService, createUsersService } from "./users.service";
import type { MongooseUsersRepo } from "../repositories/users.repository";

const hasher = {
  hash: async (p: string) => `h:${p}`,
  compare: async (p: string, h: string) => h === `h:${p}`,
};

function repos() {
  const f = new FakeUsers();
  return { fake: f, repo: f as unknown as MongooseUsersRepo };
}

describe("auth login", () => {
  beforeEach(() => resetIds());
  it("login 200 con credenciales validas", async () => {
    const { repo } = repos();
    await repo.create({ username: "admin", passwordHash: "h:secret", role: "admin_usuarios" });
    const out = await createAuthService(repo, hasher).login("admin", "secret");
    expect(out.token).toBeTypeOf("string");
    expect(out.user).toMatchObject({ username: "admin", role: "admin_usuarios" });
    expect(out.user).not.toHaveProperty("passwordHash");
  });
  it("login 401 con password invalido o usuario inexistente", async () => {
    const { repo } = repos();
    await repo.create({ username: "admin", passwordHash: "h:secret", role: "admin_usuarios" });
    await expect(createAuthService(repo, hasher).login("admin", "otra")).rejects.toMatchObject({ status: 401 });
    await expect(createAuthService(repo, hasher).login("nadie", "secret")).rejects.toMatchObject({ status: 401 });
  });
});

describe("users CRUD", () => {
  beforeEach(() => resetIds());
  it("crea 201 sin exponer hash y rechaza duplicado 409 (case-insensitive)", async () => {
    const { repo } = repos();
    const svc = createUsersService(repo, hasher);
    const u = await svc.create({ username: "Planillero", password: "abcd", role: "admin_partidos" });
    expect(u).not.toHaveProperty("passwordHash");
    await expect(svc.create({ username: "planillero", password: "abcd", role: "admin_partidos" })).rejects.toMatchObject({ status: 409 });
  });
  it("get/update/remove con 404 si no existe", async () => {
    const { repo } = repos();
    const svc = createUsersService(repo, hasher);
    await expect(svc.get("000000000000000000000099")).rejects.toMatchObject({ status: 404 });
    await expect(svc.remove("000000000000000000000099")).rejects.toMatchObject({ status: 404 });
  });
});
