import { pgTable, serial, text, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { moradoresTable } from "./moradores";

export const encomendasTable = pgTable("encomendas", {
  id: serial("id").primaryKey(),
  codigo_rastreio: text("codigo_rastreio").notNull(),
  morador_id: integer("morador_id").notNull().references(() => moradoresTable.id),
  status_valido: text("status_valido").notNull().default("pendente"),
  data_recebimento: timestamp("data_recebimento").defaultNow().notNull(),
  foto_url: text("foto_url"),
  ocr_confianca: real("ocr_confianca"),
});

export const insertEncomendaSchema = createInsertSchema(encomendasTable).omit({ id: true });
export type InsertEncomenda = z.infer<typeof insertEncomendaSchema>;
export type Encomenda = typeof encomendasTable.$inferSelect;
