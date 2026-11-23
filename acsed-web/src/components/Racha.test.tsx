import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Racha } from "./Racha";
import { LeyendaColumnas, LEYENDA_EQUIPOS } from "./LeyendaColumnas";

describe("Racha", () => {
  it("muestra badges G/E/P en orden", () => {
    render(<Racha racha={["G", "E", "P"]} />);
    expect(screen.getByLabelText("Racha: Ganado, Empatado, Perdido")).toHaveTextContent("GEP");
  });

  it("sin partidos no renderiza badges", () => {
    const { container } = render(<Racha racha={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("tolera racha undefined (datos incompletos)", () => {
    const { container } = render(<Racha racha={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("LeyendaColumnas", () => {
  it("lista la definicion de cada columna con su formula", () => {
    render(<LeyendaColumnas entradas={LEYENDA_EQUIPOS} />);
    expect(screen.getByText("Leyenda")).toBeInTheDocument();
    expect(screen.getByText("GF − GC")).toBeInTheDocument();
    expect(screen.getByText("3·PG + PE")).toBeInTheDocument();
  });
});
