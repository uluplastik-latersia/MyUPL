import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type DatabaseInstance = ReturnType<typeof getDb>;

/**
 * Returns an Edge-compatible Drizzle ORM client connected via Turso's libSQL HTTP web driver.
 * Works seamlessly in Cloudflare Pages Functions (V8 Edge Runtime) without native Node sockets or fs.
 */
export function getDb(url?: string, authToken?: string) {
  const dbUrl =
    url ||
    (typeof process !== "undefined" && process.env?.TURSO_DATABASE_URL) ||
    "";
  const token =
    authToken ||
    (typeof process !== "undefined" && process.env?.TURSO_AUTH_TOKEN) ||
    "";

  if (!dbUrl) {
    throw new Error(
      "Turso Database URL is missing. Set TURSO_DATABASE_URL in Cloudflare Pages or .env.local"
    );
  }

  const client = createClient({
    url: dbUrl,
    authToken: token,
  });

  return drizzle(client, { schema });
}
