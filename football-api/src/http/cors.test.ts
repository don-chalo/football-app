import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { config } from "../config";

describe("CORS", () => {
  it("responde Access-Control-Allow-Origin al origen configurado", async () => {
    const app = createApp();
    const origin = config.corsOrigins[0] ?? "http://localhost:5173";
    const r = await request(app).get("/health").set("Origin", origin).expect(200);
    expect(r.headers["access-control-allow-origin"]).toBe(origin);
  });

  it("preflight OPTIONS habilita metodos y Authorization", async () => {
    const app = createApp();
    const origin = config.corsOrigins[0] ?? "http://localhost:5173";
    const r = await request(app)
      .options("/ligas")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization,Content-Type")
      .expect(204);
    expect(r.headers["access-control-allow-methods"]).toMatch(/POST/);
  });

  it("origen no listado no recibe cabecera", async () => {
    const app = createApp();
    const r = await request(app).get("/health").set("Origin", "http://malicioso.test").expect(200);
    expect(r.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
