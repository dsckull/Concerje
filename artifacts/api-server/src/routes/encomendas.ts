import { Router, type IRouter } from "express";
import { db, encomendasTable, moradoresTable } from "@workspace/db";
import { eq, ilike, gte, lte, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/encomendas", async (req, res) => {
  try {
    const { apartamento, status_valido, data_inicio, data_fim, morador_id } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (status_valido) conditions.push(eq(encomendasTable.status_valido, status_valido));
    if (morador_id) conditions.push(eq(encomendasTable.morador_id, parseInt(morador_id)));
    if (data_inicio) conditions.push(gte(encomendasTable.data_recebimento, new Date(data_inicio)));
    if (data_fim) conditions.push(lte(encomendasTable.data_recebimento, new Date(data_fim)));

    let rows = await db
      .select({
        id: encomendasTable.id,
        codigo_rastreio: encomendasTable.codigo_rastreio,
        morador_id: encomendasTable.morador_id,
        morador_nome: moradoresTable.nome,
        morador_apartamento: moradoresTable.apartamento,
        morador_bloco: moradoresTable.bloco,
        status_valido: encomendasTable.status_valido,
        data_recebimento: encomendasTable.data_recebimento,
        foto_url: encomendasTable.foto_url,
        ocr_confianca: encomendasTable.ocr_confianca,
      })
      .from(encomendasTable)
      .leftJoin(moradoresTable, eq(encomendasTable.morador_id, moradoresTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    if (apartamento) {
      rows = rows.filter(r => r.morador_apartamento?.toLowerCase().includes(apartamento.toLowerCase()));
    }

    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/encomendas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select({
        id: encomendasTable.id,
        codigo_rastreio: encomendasTable.codigo_rastreio,
        morador_id: encomendasTable.morador_id,
        morador_nome: moradoresTable.nome,
        morador_apartamento: moradoresTable.apartamento,
        morador_bloco: moradoresTable.bloco,
        status_valido: encomendasTable.status_valido,
        data_recebimento: encomendasTable.data_recebimento,
        foto_url: encomendasTable.foto_url,
        ocr_confianca: encomendasTable.ocr_confianca,
      })
      .from(encomendasTable)
      .leftJoin(moradoresTable, eq(encomendasTable.morador_id, moradoresTable.id))
      .where(eq(encomendasTable.id, id));

    if (!row) return res.status(404).json({ error: "Encomenda não encontrada" });
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/encomendas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status_valido } = req.body as { status_valido: string };

    if (!status_valido) return res.status(400).json({ error: "status_valido é obrigatório" });

    const [updated] = await db
      .update(encomendasTable)
      .set({ status_valido })
      .where(eq(encomendasTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Encomenda não encontrada" });

    const [row] = await db
      .select({
        id: encomendasTable.id,
        codigo_rastreio: encomendasTable.codigo_rastreio,
        morador_id: encomendasTable.morador_id,
        morador_nome: moradoresTable.nome,
        morador_apartamento: moradoresTable.apartamento,
        morador_bloco: moradoresTable.bloco,
        status_valido: encomendasTable.status_valido,
        data_recebimento: encomendasTable.data_recebimento,
        foto_url: encomendasTable.foto_url,
        ocr_confianca: encomendasTable.ocr_confianca,
      })
      .from(encomendasTable)
      .leftJoin(moradoresTable, eq(encomendasTable.morador_id, moradoresTable.id))
      .where(eq(encomendasTable.id, id));

    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
