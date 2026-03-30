import { Router, type IRouter } from "express";
import { db, moradoresTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/moradores", async (req, res) => {
  try {
    const { apartamento, bloco, status } = req.query as Record<string, string>;
    let query = db.select().from(moradoresTable).$dynamic();

    const conditions = [];
    if (apartamento) conditions.push(ilike(moradoresTable.apartamento, `%${apartamento}%`));
    if (bloco) conditions.push(ilike(moradoresTable.bloco, `%${bloco}%`));
    if (status) conditions.push(eq(moradoresTable.status, status));

    if (conditions.length > 0) {
      const { and } = await import("drizzle-orm");
      query = query.where(and(...conditions) as any);
    }

    const moradores = await query;
    res.json(moradores);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/moradores/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [morador] = await db.select().from(moradoresTable).where(eq(moradoresTable.id, id));
    if (!morador) {
      res.status(404).json({ error: "Morador não encontrado" });
      return;
    }
    res.json(morador);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
