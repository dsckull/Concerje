import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertasDefcomTable = pgTable("alertas_defcom", {
  id: serial("id").primaryKey(),
  nivel_risco: text("nivel_risco").notNull(),
  tipo_ameaca: text("tipo_ameaca").notNull(),
  descricao: text("descricao").notNull(),
  resolucao: text("resolucao"),
  data_alerta: timestamp("data_alerta").defaultNow().notNull(),
  arquivado: boolean("arquivado").notNull().default(false),
  autoridades_acionadas: boolean("autoridades_acionadas").notNull().default(false),
});

export const insertAlertaDefcomSchema = createInsertSchema(alertasDefcomTable).omit({ id: true, data_alerta: true });
export type InsertAlertaDefcom = z.infer<typeof insertAlertaDefcomSchema>;
export type AlertaDefcom = typeof alertasDefcomTable.$inferSelect;
