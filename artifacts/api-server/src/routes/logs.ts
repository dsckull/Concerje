import { Router, type IRouter } from "express";
import { db, logsInteracaoTable, moradoresTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/logs", async (req, res) => {
  try {
    const { morador_id, perfil_emocional, data_inicio, data_fim } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (morador_id) conditions.push(eq(logsInteracaoTable.morador_id, parseInt(morador_id)));
    if (perfil_emocional) conditions.push(eq(logsInteracaoTable.perfil_emocional, perfil_emocional));
    if (data_inicio) conditions.push(gte(logsInteracaoTable.created_at, new Date(data_inicio)));
    if (data_fim) conditions.push(lte(logsInteracaoTable.created_at, new Date(data_fim)));

    const rows = await db
      .select({
        id: logsInteracaoTable.id,
        morador_id: logsInteracaoTable.morador_id,
        morador_nome: moradoresTable.nome,
        morador_apartamento: moradoresTable.apartamento,
        tipo_msg: logsInteracaoTable.tipo_msg,
        acao: logsInteracaoTable.acao,
        perfil_emocional: logsInteracaoTable.perfil_emocional,
        resultado: logsInteracaoTable.resultado,
        created_at: logsInteracaoTable.created_at,
      })
      .from(logsInteracaoTable)
      .leftJoin(moradoresTable, eq(logsInteracaoTable.morador_id, moradoresTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${logsInteracaoTable.created_at} DESC`)
      .limit(200);

    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs/stats/perfil-emocional", async (req, res) => {
  try {
    const stats = await db
      .select({
        perfil_emocional: logsInteracaoTable.perfil_emocional,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(logsInteracaoTable)
      .groupBy(logsInteracaoTable.perfil_emocional)
      .orderBy(sql`count(*) DESC`);

    res.json(stats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs/stats/acoes", async (req, res) => {
  try {
    const stats = await db
      .select({
        data: sql<string>`to_char(${logsInteracaoTable.created_at}, 'YYYY-MM-DD')`,
        total: sql<number>`cast(count(*) as integer)`,
        textos: sql<number>`cast(sum(case when ${logsInteracaoTable.tipo_msg} = 'texto' then 1 else 0 end) as integer)`,
        imagens: sql<number>`cast(sum(case when ${logsInteracaoTable.tipo_msg} = 'imagem' then 1 else 0 end) as integer)`,
      })
      .from(logsInteracaoTable)
      .where(gte(logsInteracaoTable.created_at, sql`now() - interval '30 days'`))
      .groupBy(sql`to_char(${logsInteracaoTable.created_at}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${logsInteracaoTable.created_at}, 'YYYY-MM-DD') ASC`);

    res.json(stats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
