import { Router } from "express";
import { db } from "@workspace/db";
import { financeiroTable, insertFinanceiroSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { validate, validateId } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const updateFinanceiroSchema = z.object({
  status: z.enum(["pendente", "pago", "vencido", "cancelado"]).optional(),
  valor: z.number().positive().optional(),
  descricao: z.string().max(500).optional(),
});

router.get("/financeiro/resumo", async (req, res) => {
  try {
    const rows = await db.select().from(financeiroTable);
    const receitas = rows.filter(r => r.tipo === "receita" && r.status === "pago").reduce((s, r) => s + (r.valor || 0), 0);
    const despesas = rows.filter(r => r.tipo === "despesa" && r.status === "pago").reduce((s, r) => s + (r.valor || 0), 0);
    const inadimplentes = rows.filter(r => r.tipo === "cobranca" && r.status === "vencido").length;
    const a_vencer = rows.filter(r => r.status === "pendente").length;
    res.json({ saldo: receitas - despesas, total_receitas: receitas, total_despesas: despesas, inadimplentes, a_vencer });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/financeiro", async (req, res) => {
  try {
    const { tipo, status, categoria, mes } = req.query;
    let rows = await db.select().from(financeiroTable).orderBy(sql`${financeiroTable.created_at} DESC`);
    if (tipo) rows = rows.filter(r => r.tipo === tipo);
    if (status) rows = rows.filter(r => r.status === status);
    if (categoria) rows = rows.filter(r => r.categoria === categoria);
    if (mes) rows = rows.filter(r => r.referencia_mes === mes);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/financeiro", validate(insertFinanceiroSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.valor) data.valor = parseFloat(String(data.valor));
    if (data.data_vencimento) data.data_vencimento = new Date(data.data_vencimento);
    const [row] = await db.insert(financeiroTable).values(data).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Erro ao criar lançamento" });
  }
});

router.patch("/financeiro/:id", validateId, validate(updateFinanceiroSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [row] = await db
      .update(financeiroTable)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(financeiroTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Lançamento não encontrado" });
      return;
    }
    res.json(row);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Erro ao atualizar lançamento" });
  }
});

export default router;
