import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "./estado";

describe("maquina de estados del partido", () => {
  it("permite programado -> en_juego -> finalizado", () => {
    expect(canTransition("programado", "en_juego")).toBe(true);
    expect(canTransition("en_juego", "finalizado")).toBe(true);
  });
  it("rechaza volver a programado desde cualquier estado", () => {
    expect(canTransition("en_juego", "programado")).toBe(false);
    expect(canTransition("finalizado", "programado")).toBe(false);
    expect(canTransition("finalizado", "en_juego")).toBe(false);
  });
  it("rechaza saltos programado -> finalizado", () => {
    expect(canTransition("programado", "finalizado")).toBe(false);
  });
  it("assertTransition lanza en transicion invalida", () => {
    expect(() => assertTransition("finalizado", "programado")).toThrow("Transicion no permitida");
  });
});
