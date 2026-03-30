import { Router, type IRouter } from "express";
import { db, moradoresTable, insertMoradorSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

/**
 * POST /moradores/bulk
 * Recebe um array de objetos Morador (sem id/created_at) e insere em lote.
 * Validação feita com Zod schema `insertMoradorSchema`.
 * Duplicatas por telefone são ignoradas (onConflictDoNothing).
 */
router.post("/moradores/bulk", async (req, res) => {
  try {
    const payload = req.body as { moradores: unknown[] };
    if (!payload?.moradores || !Array.isArray(payload.moradores)) {
      res.status(400).json({ error: "Payload must contain a 'moradores' array" });
      return;
    }

    const valid: any[] = [];
    const errors: { row: number; message: string }[] = [];

    payload.moradores.forEach((item, idx) => {
      const result = insertMoradorSchema.safeParse(item);
      if (result.success) {
        valid.push(result.data);
      } else {
        errors.push({ row: idx + 1, message: result.error.message });
      }
    });

    // Insert em lote, ignorando conflitos de telefone (único)
    const inserted = await db
      .insert(moradoresTable)
      .values(valid)
      .onConflictDoNothing({ target: moradoresTable.telefone })
      .returning();

    const skipped = valid.length - inserted.length;
    res.json({ inserted: inserted.length, skipped, errors });
    return;
  } catch (err) {
    // @ts-ignore
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

export default router;
