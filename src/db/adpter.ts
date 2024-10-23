import { db } from "@/db/index";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "@/db/schema";

export const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
