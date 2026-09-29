import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { JSX } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./Session";

function Probe(): JSX.Element {
  const { user, login, logout } = useSession();
  return (
    <div>
      <span data-testid="user">{user ? user.username : "anon"}</span>
      <button type="button" onClick={() => void login("plan", "plan1234")}>
        entrar
      </button>
      <button type="button" onClick={logout}>
        salir
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
});
