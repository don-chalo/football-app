import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { JSX } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./Session";

function Probe(): JSX.Element {
  const { user, misLigas, login, logout, agregarLiga, quitarLiga } = useSession();
  return (
    <div>
      <span data-testid="user">{user ? user.username : "anon"}</span>
      <span data-testid="ligas">{misLigas.join(",")}</span>
      <button type="button" onClick={() => void login("plan", "plan1234")}>
        entrar
      </button>
      <button type="button" onClick={logout}>
        salir
      </button>
      <button type="button" onClick={() => { agregarLiga("l2"); }}>
        agregar
      </button>
      <button type="button" onClick={() => { quitarLiga("l1"); }}>
        quitar
      </button>
    </div>
  );
}

describe("Session login/logout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("guarda sesión y misLigas, y sale limpiando", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ token: "t", user: { id: "1", username: "plan", role: "admin_partidos" }, misLigas: ["l1"] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    render(
      <MemoryRouter>
        <SessionProvider>
          <Probe />
        </SessionProvider>
      </MemoryRouter>,
    );
    await user.click(screen.getByText("entrar"));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("plan"));
    expect(localStorage.getItem("acsed.token")).toBe("t");
    expect(localStorage.getItem("acsed.misLigas")).toBe('["l1"]');
    await user.click(screen.getByText("salir"));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("anon"));
    expect(localStorage.getItem("acsed.token")).toBeNull();
  });

  it("agregar/quitar liga actualiza sesion y persistencia sin duplicar", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ token: "t", user: { id: "1", username: "plan", role: "admin_partidos" }, misLigas: ["l1"] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    render(
      <MemoryRouter>
        <SessionProvider>
          <Probe />
        </SessionProvider>
      </MemoryRouter>,
    );
    await user.click(screen.getByText("entrar"));
    await waitFor(() => expect(screen.getByTestId("ligas")).toHaveTextContent("l1"));

    await user.click(screen.getByText("agregar"));
    await waitFor(() => expect(screen.getByTestId("ligas")).toHaveTextContent("l1,l2"));
    await user.click(screen.getByText("agregar"));
    expect(screen.getByTestId("ligas")).toHaveTextContent("l1,l2");
    expect(localStorage.getItem("acsed.misLigas")).toBe('["l1","l2"]');

    await user.click(screen.getByText("quitar"));
    await waitFor(() => expect(screen.getByTestId("ligas")).toHaveTextContent("l2"));
    expect(localStorage.getItem("acsed.misLigas")).toBe('["l2"]');
  });
});
