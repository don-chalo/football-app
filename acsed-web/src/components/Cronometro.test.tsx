import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Cronometro } from "./Cronometro";

function mockFetch() {
  return vi.fn(async (url: string | URL, init?: RequestInit): Promise<Response> => {
    if ((init?.method ?? "GET") === "POST") return new Response(JSON.stringify({ id: "p1" }), { status: 200 });
    return new Response("[]", { status: 200 });
  });
}

describe("Cronometro", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra tiempo y pausa con POST", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();
    render(
      <Cronometro
        partido={{ id: "p1", estado: "en_juego", inicioEn: new Date(Date.now() - 65 * 60_000).toISOString(), pausaDesde: null, pausaAcumSeg: 0, finEn: null }}
        onCambio={onCambio}
      />,
    );

    expect(screen.getByText("EN JUEGO")).toBeInTheDocument();
    expect(screen.getByText(/^65:/)).toBeInTheDocument();
    await user.click(screen.getByText("Pausar"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/partidos/p1/pausa"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    const [, init] = fetchMock.mock.calls.find(([, i]) => (i as RequestInit).method === "POST") as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string) as unknown).toMatchObject({ pausada: true });
    vi.unstubAllGlobals();
  });

  it("pausado ofrece reanudar", () => {
    vi.stubGlobal("fetch", mockFetch());
    render(
      <Cronometro
        partido={{ id: "p1", estado: "en_juego", inicioEn: new Date(Date.now() - 65 * 60_000).toISOString(), pausaDesde: new Date().toISOString(), pausaAcumSeg: 0, finEn: null }}
        onCambio={vi.fn()}
      />,
    );

    expect(screen.getByText("PAUSADO")).toBeInTheDocument();
    expect(screen.getByText("Reanudar")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
