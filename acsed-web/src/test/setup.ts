import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sin globals:true en Vitest no hay auto-cleanup: se hace explícito
// para que cada test parta de un DOM limpio.
afterEach(() => {
  cleanup();
});
