import { describe, expect, it } from "vitest";
import { minutoDePartido, textoReloj } from "./useCronometro";

const BASE = "2026-03-01T15:00:00Z";
const T = (s: string): number => new Date(s).getTime();

function reloj(over: Partial<Parameters<typeof minutoDePartido>[0]> = {}) {
  return {
    estado: "en_juego",
    inicioEn: BASE,
    pausaDesde: null,
    pausaAcumSeg: 0,
    finEn: null,
    ...over,
  };
}

describe("minutoDePartido", () => {
  it("null si nunca inicio", () => {
    expect(minutoDePartido(reloj({ inicioEn: null }), T(BASE))).toBeNull();
  });

  it("minuto 1-based corriendo", () => {
    expect(minutoDePartido(reloj(), T(BASE))).toBe(1);
    expect(minutoDePartido(reloj(), T("2026-03-01T15:00:59Z"))).toBe(1);
    expect(minutoDePartido(reloj(), T("2026-03-01T15:01:00Z"))).toBe(2);
    expect(minutoDePartido(reloj(), T("2026-03-01T16:04:00Z"))).toBe(65);
  });

  it("pausa resta solo hasta reanudar", () => {
    const p = reloj({ pausaAcumSeg: 600 });
    expect(minutoDePartido(p, T("2026-03-01T16:04:00Z"))).toBe(55);
  });

  it("pausa abierta congela", () => {
    const p = reloj({ pausaDesde: "2026-03-01T15:30:00Z" });
    expect(minutoDePartido(p, T("2026-03-01T15:40:00Z"))).toBe(31);
  });

  it("fin congela en el minuto final", () => {
    const p = reloj({ estado: "finalizado", finEn: "2026-03-01T16:33:00Z", pausaAcumSeg: 0 });
    expect(minutoDePartido(p, T("2026-03-01T18:00:00Z"))).toBe(94);
  });
});

describe("textoReloj", () => {
  it("MM:SS con ceros", () => {
    expect(textoReloj(reloj(), T("2026-03-01T16:03:07Z"))).toBe("63:07");
  });

  it("null si nunca inicio", () => {
    expect(textoReloj(reloj({ inicioEn: null }), T(BASE))).toBeNull();
  });
});
