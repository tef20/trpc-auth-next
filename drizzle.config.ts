import { type Config, defineConfig } from "drizzle-kit";
import { env } from "./src/env.mjs";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
}) satisfies Config;
