import { describe, expect, it } from "vitest";
import { porFechaDesc } from "./orden";

describe("porFechaDesc", () => {
  it("más nuevos primero sin mutar", () => {
    const items = [
      { id: "a", fecha: "2026-01-01T00:00:00Z" },
      { id: "b", fecha: "2026-03-01T00:00:00Z" },
      { id: "c", fecha: "2026-02-01T00:00:00Z" },
    ];
    expect(porFechaDesc(items).map((i) => i.id)).toEqual(["b", "c", "a"]);
    expect(items[0]?.id).toBe("a");
  });
});
