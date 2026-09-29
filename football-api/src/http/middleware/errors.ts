import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  if (typeof err === "object" && err !== null && (err as { name?: string }).name === "CastError") {
    res.status(404).json({ code: "NOT_FOUND", message: "Recurso no encontrado" });
    return;
  }
  if (err instanceof ZodError) {    res.status(422).json({
      code: "UNPROCESSABLE",
      message: "Datos invalidos",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  console.error(err);
  res.status(500).json({ code: "INTERNAL", message: "Error interno" });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch((err: unknown) => {
      next(err);
    });
  };
}
