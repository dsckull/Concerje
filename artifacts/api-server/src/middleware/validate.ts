import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

export function validate(schema: z.ZodTypeAny | any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as any)?.issues ?? (result.error as any)?.errors ?? [];
      const errors = Array.isArray(issues)
        ? issues.map((e: any) => ({
            field: Array.isArray(e.path) ? e.path.join(".") : String(e.path ?? ""),
            message: e.message ?? "Valor inválido",
          }))
        : [{ field: "body", message: "Formato inválido" }];
      res.status(400).json({
        error: "Dados inválidos",
        detail: errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateId(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id as string);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  next();
}

export function sanitizeString(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
