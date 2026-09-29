export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, "BAD_REQUEST", message);
}

export function unauthorized(message = "No autenticado"): HttpError {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Sin permiso"): HttpError {
  return new HttpError(403, "FORBIDDEN", message);
}

export function notFound(resource: string): HttpError {
  return new HttpError(404, "NOT_FOUND", `${resource} no encontrado`);
}

export function conflict(message: string): HttpError {
  return new HttpError(409, "CONFLICT", message);
}

export function unprocessable(message: string): HttpError {
  return new HttpError(422, "UNPROCESSABLE", message);
}
