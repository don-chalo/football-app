import { describe, expect, it } from "vitest";
import { rendimiento, rendimientoValor } from "./rendimiento";

describe("rendimiento", () => {
  it("un decimal", () => {
    expect(rendimiento(2, 0, 3)).toBe("66.7");
    expect(rendimiento(3, 0, 3)).toBe("100.0");
    expect(rendimiento(0, 0, 3)).toBe("0.0");
  });

  it("sin partidos muestra guion y va al fondo", () => {
    expect(rendimiento(0, 0, 0)).toBe("–");
    expect(rendimientoValor(0, 0, 0)).toBe(-1);
    expect(rendimientoValor(2, 0, 3)).toBeGreaterThan(rendimientoValor(1, 0, 3));
  });
});
