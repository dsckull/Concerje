import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { moradoresTable } from "./moradores";

export const logsInteracaoTable = pgTable("logs_interacao", {
  id: serial("id").primaryKey(),
  morador_id: integer("morador_id").notNull().references(() => moradoresTable.id),
  tipo_msg: text("tipo_msg").notNull(),
  acao: text("acao").notNull(),
  perfil_emocional: text("perfil_emocional").notNull().default("neutro"),
  resultado: text("resultado").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertLogInteracaoSchema = createInsertSchema(logsInteracaoTable).omit({ id: true, created_at: true });
export type InsertLogInteracao = z.infer<typeof insertLogInteracaoSchema>;
export type LogInteracao = typeof logsInteracaoTable.$inferSelect;
