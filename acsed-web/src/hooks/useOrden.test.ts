import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOrden } from "./useOrden";

const filas = [
  { nombre: "Beto", pts: 3 },
  { nombre: "Ana", pts: 6 },
  { nombre: "Carlos", pts: 0 },
];

describe("useOrden", () => {
  it("default conserva el orden del API", () => {
    const { result } = renderHook(() => useOrden(filas, (f, k) => (k === "nombre" ? f.nombre : f.pts)));
    expect(result.current.filas.map((f) => f.nombre)).toEqual(["Beto", "Ana", "Carlos"]);
  });

  it("ciclo ASC -> DESC -> default en numérico", () => {
    const { result } = renderHook(() => useOrden(filas, (f, k) => (k === "nombre" ? f.nombre : f.pts)));
    act(() => result.current.alternar("pts"));
    expect(result.current.filas.map((f) => f.pts)).toEqual([0, 3, 6]);
    act(() => result.current.alternar("pts"));
    expect(result.current.filas.map((f) => f.pts)).toEqual([6, 3, 0]);
    act(() => result.current.alternar("pts"));
    expect(result.current.filas.map((f) => f.nombre)).toEqual(["Beto", "Ana", "Carlos"]);
  });

  it("nombre ordena con locale", () => {
    const { result } = renderHook(() => useOrden(filas, (f, k) => (k === "nombre" ? f.nombre : f.pts)));
    act(() => result.current.alternar("nombre"));
    expect(result.current.filas.map((f) => f.nombre)).toEqual(["Ana", "Beto", "Carlos"]);
  });
});
