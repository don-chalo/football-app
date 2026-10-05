import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonFilas } from "./ui";

describe("SkeletonFilas", () => {
  it("renderiza N filas con rol status", () => {
    render(<SkeletonFilas filas={4} />);
    expect(screen.getByRole("status", { name: "Cargando" })).toBeInTheDocument();
    expect(screen.getByRole("status").children).toHaveLength(4);
  });
});
