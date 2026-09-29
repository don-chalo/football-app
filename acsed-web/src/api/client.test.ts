import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, mensajeError } from "./client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("lanza ApiError con status/code ante 422", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      jsonResponse(422, { code: "UNPROCESSABLE", message: "Datos inválidos" }),
    ));
    await expect(api.get("/x")).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });
  });

  it("envía el token guardado y mapea 401/403/409", async () => {
    localStorage.setItem("acsed.token", "abc");
    const fetchMock = vi.fn(async () => jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await api.get("/ligas");
    const llamada = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(llamada[1].headers).get("Authorization")).toBe("Bearer abc");

    expect(mensajeError(new ApiError(401, "UNAUTHORIZED", "x"))).toContain("Sesión");
    expect(mensajeError(new ApiError(403, "FORBIDDEN", "x"))).toContain("permiso");
    expect(mensajeError(new ApiError(409, "CONFLICT", "En uso"))).toBe("En uso");
    expect(mensajeError(new Error("red"))).toContain("Reintenta");
  });

  it("204 sin cuerpo resuelve undefined", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    await expect(api.del("/x")).resolves.toBeUndefined();
  });
});
