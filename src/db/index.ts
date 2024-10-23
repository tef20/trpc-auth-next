import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqliteDb = new sqlite("db/sqlite-database.db");

export const db = drizzle(sqliteDb);
