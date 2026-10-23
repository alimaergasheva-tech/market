import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.warn(
    "[drizzle] DATABASE_URL пуст — generate/migrate сработают после добавления URL в .env.local",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/techno_market",
  },
  strict: true,
  verbose: true,
});
