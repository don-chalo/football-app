import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import { describe, expect, it } from "vitest";
import { RequireAdmin, RequireSistema } from "./guards";
import { SessionProvider } from "./Session";

function App({ ruta }: { ruta: string }): JSX.Element {
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <SessionProvider>
        <Routes>
          <Route path="/login" element={<span>login</span>} />
          <Route path="/admin" element={<RequireAdmin><span>admin</span></RequireAdmin>} />
          <Route path="/sys" element={<RequireSistema><span>sis</span></RequireSistema>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>
  );
}

describe("guardas por rol", () => {
  it("anonimo va a login; sistema entra a todo", () => {
    localStorage.clear();
    const { unmount } = render(<App ruta="/admin" />);
    expect(screen.getByText("login")).toBeInTheDocument();
    unmount();
    localStorage.setItem("acsed.token", "t");
    localStorage.setItem("acsed.user", JSON.stringify({ id: "1", username: "super", role: "admin_usuarios" }));
    localStorage.setItem("acsed.misLigas", JSON.stringify([]));
    render(<App ruta="/sys" />);
    expect(screen.getByText("sis")).toBeInTheDocument();
  });
});
