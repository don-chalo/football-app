import { describe, expect, it } from "vitest";
import { computeMarcador, cuentaComoGoleador, equipoQueSuma, golesFavorContra } from "./marcador";
import type { EventoBase } from "./types";

const A = "eqA";
const B = "eqB";

describe("equipoQueSuma (Strategy por tipo)", () => {
  it("gol y penal suman al equipo del jugador", () => {
    expect(equipoQueSuma({ jugadorId: "j", equipoId: A, tipo: "gol" }, A, B)).toBe(A);
    expect(equipoQueSuma({ jugadorId: "j", equipoId: B, tipo: "penal" }, A, B)).toBe(B);
  });
  it("autogol suma al rival", () => {
    expect(equipoQueSuma({ jugadorId: "j", equipoId: A, tipo: "autogol" }, A, B)).toBe(B);
    expect(equipoQueSuma({ jugadorId: "j", equipoId: B, tipo: "autogol" }, A, B)).toBe(A);
  });
  it("tipo futuro desconocido lanza (no se absorbe en silencio)", () => {
    const raro = { jugadorId: "j", equipoId: A, tipo: "asistencia" } as unknown as EventoBase;
    expect(() => equipoQueSuma(raro, A, B)).toThrow();
  });
});

describe("computeMarcador", () => {
  it("suma goles: 2-1 con autogol rival incluido", () => {
    const eventos: EventoBase[] = [
      { jugadorId: "j1", equipoId: A, tipo: "gol" },
      { jugadorId: "j2", equipoId: B, tipo: "gol" },
      { jugadorId: "j3", equipoId: B, tipo: "autogol" },
    ];
    expect(computeMarcador(eventos, A, B)).toEqual({ local: 2, visita: 1 });
  });
  it("partido sin eventos es 0-0", () => {
    expect(computeMarcador([], A, B)).toEqual({ local: 0, visita: 0 });
  });
});

describe("golesFavorContra", () => {
  it("autogol cuenta GC propio y GF rival", () => {
    const eventos: EventoBase[] = [{ jugadorId: "j", equipoId: A, tipo: "autogol" }];
    expect(golesFavorContra(eventos, A, A, B)).toEqual({ gf: 0, gc: 1 });
    expect(golesFavorContra(eventos, B, A, B)).toEqual({ gf: 1, gc: 0 });
  });
});

describe("cuentaComoGoleador", () => {
  it("gol y penal si, autogol no", () => {
    expect(cuentaComoGoleador("gol")).toBe(true);
    expect(cuentaComoGoleador("penal")).toBe(true);
    expect(cuentaComoGoleador("autogol")).toBe(false);
  });
});
