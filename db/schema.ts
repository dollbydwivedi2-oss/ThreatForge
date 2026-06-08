import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const scanResults = pgTable("scan_results", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  message: text().notNull(),
  verdict: text().notNull(),
  score: integer().notNull(),
  reason: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
