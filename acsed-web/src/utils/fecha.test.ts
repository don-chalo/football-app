import { describe, expect, it } from "vitest";
import { formatoFechaCorta, formatoHora } from "./fecha";

describe("fecha", () => {
  it("corta sin segundos", () => {
    expect(formatoFechaCorta("2026-03-01T15:00:00Z")).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it("hora HH:MM", () => {
    expect(formatoHora("2026-03-01T15:05:00Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});
