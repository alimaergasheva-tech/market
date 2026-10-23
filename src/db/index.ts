import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

/**
 * Клиент Drizzle → Neon.
 * Требует DATABASE_URL в .env.local (см. NEON.md).
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL не задан. Создайте проект Neon и добавьте строку в web/.env.local (инструкция в web/NEON.md).",
    );
  }

  const sql = neon(url);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof getDb>;
