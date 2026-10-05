import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "../auth/Session";
import type { JSX } from "react";
import { GestionPage } from "./GestionPage";

function LigasProbe(): JSX.Element {
  const { misLigas } = useSession();
  return <span data-testid="ligas">{misLigas.join(",")}</span>;
}

describe("misLigas tras crear liga", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("acsed.token", "t");
    localStorage.setItem("acsed.user", JSON.stringify({ id: "1", username: "plan", role: "admin_partidos" }));
    localStorage.setItem("acsed.misLigas", JSON.stringify(["l1"]));
    vi.unstubAllGlobals();
  });

  it("crear liga la agrega a la sesion y persiste", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (url: unknown, init?: RequestInit): Promise<Response> => {
      const u = String(url);
      if ((init?.method ?? "GET") === "POST" && u.endsWith("/ligas")) {
        return new Response(JSON.stringify({ id: "l9", nombre: "Nueva", formato: "liga", idaVuelta: false }), { status: 201 });
      }
      if (u.endsWith("/ligas")) {
        return new Response(JSON.stringify([{ id: "l1", nombre: "Vieja", formato: "liga", idaVuelta: false }]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <SessionProvider>
          <GestionPage />
          <LigasProbe />
        </SessionProvider>
      </MemoryRouter>,
    );

    await user.type(await screen.findByLabelText("Nombre de liga"), "Nueva");
    await user.click(screen.getByText("Crear liga"));

    await waitFor(() => expect(screen.getByTestId("ligas")).toHaveTextContent("l1,l9"));
    expect(localStorage.getItem("acsed.misLigas")).toBe('["l1","l9"]');
    vi.unstubAllGlobals();
  });
});
