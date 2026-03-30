import { Router, type IRouter } from "express";
import { db, alertasDefcomTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/alertas", async (req, res) => {
  try {
    const { nivel_risco, tipo_ameaca, resolvido } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (nivel_risco) conditions.push(eq(alertasDefcomTable.nivel_risco, nivel_risco));
    if (tipo_ameaca) conditions.push(eq(alertasDefcomTable.tipo_ameaca, tipo_ameaca));
    if (resolvido !== undefined) conditions.push(eq(alertasDefcomTable.arquivado, resolvido === "true"));

    const rows = await db
      .select()
      .from(alertasDefcomTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(alertasDefcomTable.data_alerta);

    res.json(rows.reverse());
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/alertas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [alerta] = await db.select().from(alertasDefcomTable).where(eq(alertasDefcomTable.id, id));
    if (!alerta) {
      res.status(404).json({ error: "Alerta não encontrado" });
      return;
    }
    res.json(alerta);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/alertas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { arquivado, autoridades_acionadas, resolucao } = req.body as {
      arquivado?: boolean;
      autoridades_acionadas?: boolean;
      resolucao?: string;
    };

    const updateData: any = {};
    if (arquivado !== undefined) updateData.arquivado = arquivado;
    if (autoridades_acionadas !== undefined) updateData.autoridades_acionadas = autoridades_acionadas;
    if (resolucao !== undefined) updateData.resolucao = resolucao;

    const [updated] = await db
      .update(alertasDefcomTable)
      .set(updateData)
      .where(eq(alertasDefcomTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Alerta não encontrado" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
