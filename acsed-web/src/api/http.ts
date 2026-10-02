/** Contrato mínimo de transporte HTTP para los servicios de dominio. */
export interface HttpClient {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, data?: unknown) => Promise<T>;
  put: <T>(path: string, data: unknown) => Promise<T>;
  patch: <T>(path: string, data: unknown) => Promise<T>;
  del: (path: string) => Promise<void>;
}

/** Construye un path con query string codificada; omite valores vacíos. */
export function conQuery(path: string, params: object): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
