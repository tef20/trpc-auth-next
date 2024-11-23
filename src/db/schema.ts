import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    passwordHash: text("password_hash"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
    // case insensitive email uniqueness handled below
    email: text("email").notNull(),
    username: text("username"),
    isVerified: boolean("verified").notNull().default(false),
  },
  (table) => [
    // emails should be unique but case insensitive
    uniqueIndex("emailUniqueIndex").on(sql`lower(${table.email})`),
  ],
);

export const unverifiedUsersTable = pgTable(
  "unverified_users",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    username: text("username").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    verificationCodeHash: text("verification_code_hash").notNull(),
  },
  (table) => [
    // emails should be unique but case insensitive
    uniqueIndex("unverifiedEmailUniqueIndex").on(sql`lower(${table.email})`),
  ],
);

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

export type InsertUnverifiedUser = typeof unverifiedUsersTable.$inferInsert;
export type SelectUnverifiedUser = typeof unverifiedUsersTable.$inferSelect;

export type InsertSession = typeof sessionsTable.$inferInsert;
export type SelectSession = typeof sessionsTable.$inferSelect;
