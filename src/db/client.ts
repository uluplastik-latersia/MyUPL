import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type DatabaseInstance = ReturnType<typeof getDb>;

const DEFAULT_TURSO_DATABASE_URL =
  "libsql://myupl-uluplastik-latersia.aws-ap-northeast-1.turso.io";
const DEFAULT_TURSO_AUTH_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3NTc2MzIsImlkIjoiMDFhMGYxNzItYzEwMS03NTM1LWFhZmItNzZjYzIyODI5OGExIiwia2lkIjoiVVphbDJtdjNFNmdxcUdxeDhEbk9BcDNXby1lb1M3TjhVbWhTY2d2NnFZSSIsInJpZCI6ImM5ODA4ZjE3LTkzYTYtNDVjMi1hZTI0LTU5Nzg1OGQ3NjAzNSJ9.itumCDJEd1AsvBnd6MAcGL1FVtu4n1v_3l_h1YOEqmY3Euec-HW-brC-ltk2pYQrGoO7tKpJxsAtpDEre1dXDw";

/**
 * Returns an Edge-compatible Drizzle ORM client connected via Turso's libSQL HTTP web driver.
 * Works seamlessly in Cloudflare Pages Functions (V8 Edge Runtime) without native Node sockets or fs.
 */
export function getDb(url?: string, authToken?: string) {
  const dbUrl =
    url ||
    (typeof process !== "undefined" && process.env?.TURSO_DATABASE_URL) ||
    DEFAULT_TURSO_DATABASE_URL;
  const token =
    authToken ||
    (typeof process !== "undefined" && process.env?.TURSO_AUTH_TOKEN) ||
    DEFAULT_TURSO_AUTH_TOKEN;

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
