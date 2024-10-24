import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  username: text("username").notNull().unique(),
});

export const sessionsTable = pgTable("sessions", {
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  invalid: boolean("invalid").notNull().default(false),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertSession = typeof sessionsTable.$inferInsert;
export type SelectSession = typeof sessionsTable.$inferSelect;
