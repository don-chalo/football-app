const TOKEN_KEY = "acsed.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible: sesión solo en memoria */
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

interface ErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(apiUrl(path), { ...init, headers });
  if (res.status === 204) return undefined as T;
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const b = (body ?? {}) as ErrorBody;
    throw new ApiError(res.status, b.code ?? "ERROR", b.message ?? `Error ${String(res.status)}`, b.details);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) => apiFetch<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) => apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  del: (path: string): Promise<void> => {
    return apiFetch<unknown>(path, { method: "DELETE" }).then(() => undefined);
  },
};

/** Mensaje amable por estado para la UI. */
export function mensajeError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        return "Sesión vencida o sin acceso. Ingresa de nuevo.";
      case 403:
        return "Sin permiso para esta acción o liga.";
      case 404:
        return "No encontrado.";
      case 409:
        return err.message || "Nombre en uso.";
      case 422:
        return err.message || "Datos inválidos.";
      default:
        return err.message || "Error de red. Reintenta manualmente.";
    }
  }
  return "Error de red. Reintenta manualmente.";
}
