import express from "express";
import request from "supertest";
import { describe, it } from "vitest";
import { requireAdmin, requireAuth, requireUserAdmin, signToken } from "./middleware/auth";
import { errorHandler } from "./middleware/errors";

function appWith(...mw: express.RequestHandler[]): express.Express {
  const app = express();
  app.get("/probe", ...mw, (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe("auth middleware", () => {
  const tokenPartidos = signToken({ sub: "u1", role: "admin_partidos" });
  const tokenUsuarios = signToken({ sub: "u2", role: "admin_usuarios" });

  it("401 sin token", async () => {
    await request(appWith(requireAuth)).get("/probe").expect(401);
  });
  it("401 con token invalido", async () => {
    await request(appWith(requireAuth)).get("/probe").set("Authorization", "Bearer roto").expect(401);
  });
  it("403 admin_partidos en ruta solo admin_usuarios; admin_usuarios pasa (superset)", async () => {
    await request(appWith(requireAuth, requireUserAdmin)).get("/probe").set("Authorization", `Bearer ${tokenPartidos}`).expect(403);
    await request(appWith(requireAuth, requireUserAdmin)).get("/probe").set("Authorization", `Bearer ${tokenUsuarios}`).expect(200);
  });
  it("requireAdmin acepta ambos roles", async () => {
    await request(appWith(requireAuth, requireAdmin)).get("/probe").set("Authorization", `Bearer ${tokenPartidos}`).expect(200);
    await request(appWith(requireAuth, requireAdmin)).get("/probe").set("Authorization", `Bearer ${tokenUsuarios}`).expect(200);
  });
});
