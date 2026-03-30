import { Router } from "express";
import { db } from "@workspace/db";
import { assembleiasTable, votacoesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/assembleias", async (req, res) => {
  try {
    const { status } = req.query;
    let rows = await db.select().from(assembleiasTable).orderBy(sql`${assembleiasTable.data_realizacao} DESC`);
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assembleias/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [assembleia] = await db.select().from(assembleiasTable).where(eq(assembleiasTable.id, id));
    if (!assembleia) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const votacoes = await db.select().from(votacoesTable).where(eq(votacoesTable.assembleia_id, id));
    res.json({ ...assembleia, votacoes });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/assembleias", async (req, res) => {
  try {
    const [row] = await db.insert(assembleiasTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/assembleias/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [row] = await db.update(assembleiasTable).set({ ...req.body, updated_at: new Date() }).where(eq(assembleiasTable.id, id)).returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
