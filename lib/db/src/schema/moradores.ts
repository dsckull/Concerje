import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moradoresTable = pgTable("moradores", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  apartamento: text("apartamento").notNull(),
  bloco: text("bloco").notNull(),
  telefone: text("telefone").notNull().unique(),
  status: text("status").notNull().default("ativo"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoradorSchema = createInsertSchema(moradoresTable).omit({ id: true, created_at: true });
export type InsertMorador = z.infer<typeof insertMoradorSchema>;
export type Morador = typeof moradoresTable.$inferSelect;
