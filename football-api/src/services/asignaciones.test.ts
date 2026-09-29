import { beforeEach, describe, expect, it } from "vitest";
import { FakeAsignaciones, FakeLigas, FakeUsers, resetIds } from "../testing/fakes";
import { createAsignacionesService } from "./asignaciones.service";

function setup() {
  const cast = (x: unknown) => x as never;
  const asig = new FakeAsignaciones();
  const users = new FakeUsers();
  const ligas = new FakeLigas();
  const svc = createAsignacionesService({ asignaciones: cast(asig), users: cast(users), ligas: cast(ligas) });
  return { asig, users, ligas, svc };
}

describe("asignaciones", () => {
  beforeEach(() => resetIds());

  it("asigna 201, duplicada 409", async () => {
    const { users, ligas, svc } = setup();
    const u = await (users as unknown as { create(d: never): Promise<{ id: string }> }).create(
      { username: "plan", passwordHash: "h", role: "admin_partidos" } as never,
    );
    const l = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create(
      { nombre: "L", formato: "liga" } as never,
    );
    const a = await svc.asignar(u.id, l.id);
    expect(a).toMatchObject({ userId: u.id, ligaId: l.id });
    await expect(svc.asignar(u.id, l.id)).rejects.toMatchObject({ status: 409 });
  });

  it("rechaza assignee admin_usuarios 422 y destinos inexistentes 404", async () => {
    const { users, ligas, svc } = setup();
    const su = await (users as unknown as { create(d: never): Promise<{ id: string }> }).create(
      { username: "super", passwordHash: "h", role: "admin_usuarios" } as never,
    );
    const l = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create(
      { nombre: "L", formato: "liga" } as never,
    );
    await expect(svc.asignar(su.id, l.id)).rejects.toMatchObject({ status: 422 });
    await expect(svc.asignar("000000000000000000000099", l.id)).rejects.toMatchObject({ status: 404 });
    await expect(svc.asignar(su.id, "000000000000000000000099")).rejects.toMatchObject({ status: 404 });
  });

  it("mínimo-1: quitar último 422, con dos permite", async () => {
    const { users, ligas, svc } = setup();
    const mk = (n: string) =>
      (users as unknown as { create(d: never): Promise<{ id: string }> }).create(
        { username: n, passwordHash: "h", role: "admin_partidos" } as never,
      );
    const u1 = await mk("a");
    const u2 = await mk("b");
    const l = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create(
      { nombre: "L", formato: "liga" } as never,
    );
    await svc.asignar(u1.id, l.id);
    await expect(svc.quitar(u1.id, l.id)).rejects.toMatchObject({ status: 422 });
    await svc.asignar(u2.id, l.id);
    await svc.quitar(u1.id, l.id);
    await expect(svc.quitar("000000000000000000000099", l.id)).rejects.toMatchObject({ status: 404 });
  });
});
