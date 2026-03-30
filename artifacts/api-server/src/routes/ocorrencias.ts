import { Router } from "express";
import { db } from "@workspace/db";
import { ocorrenciasTable, insertOcorrenciaSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { validate, validateId } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const updateOcorrenciaSchema = z.object({
  status: z.enum(["aberta", "em_andamento", "resolvida", "cancelada"]).optional(),
  prioridade: z.enum(["baixa", "normal", "alta", "urgente"]).optional(),
  resposta: z.string().max(2000).optional(),
  responsavel: z.string().max(200).optional(),
});

router.get("/ocorrencias", async (req, res) => {
  try {
    const { tipo, status, prioridade } = req.query;
    let rows = await db.select().from(ocorrenciasTable).orderBy(sql`${ocorrenciasTable.created_at} DESC`);
    if (tipo) rows = rows.filter(r => r.tipo === tipo);
    if (status) rows = rows.filter(r => r.status === status);
    if (prioridade) rows = rows.filter(r => r.prioridade === prioridade);
    res.json(rows);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Erro ao listar ocorrências" });
  }
});

router.post("/ocorrencias", validate(insertOcorrenciaSchema), async (req, res) => {
  try {
    const [row] = await db.insert(ocorrenciasTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Erro ao criar ocorrência" });
  }
});

router.patch("/ocorrencias/:id", validateId, validate(updateOcorrenciaSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [row] = await db
      .update(ocorrenciasTable)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(ocorrenciasTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Ocorrência não encontrada" });
      return;
    }
    res.json(row);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Erro ao atualizar ocorrência" });
  }
});

export default router;
