import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("footer del sitio", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("muestra marca, espejo de navegación, Instagram y temporada actual", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (): Promise<Response> => new Response("[]", { status: 200 })),
    );
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Navegación del pie" });
    expect(nav).toBeInTheDocument();
    expect(nav.querySelector('a[href="/ligas"]')).toBeInTheDocument();
    expect(nav.querySelector('a[href="/estadisticas"]')).toBeInTheDocument();

    const ig = screen.getByRole("link", { name: "@fcacsed" });
    expect(ig.getAttribute("href")).toBe("https://www.instagram.com/fcacsed");
    expect(ig.getAttribute("target")).toBe("_blank");

    expect(
      screen.getByText(`Temporada ${new Date().getFullYear()}`),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
