import { getDb } from "@/db/client";
import { departments } from "@/db/schema";
import { asc } from "drizzle-orm";

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);
    const result = await db.select().from(departments).orderBy(asc(departments.name));

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);
    const body = (await context.request.json()) as { name: string; id?: string };

    if (!body?.name?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Department name is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const id = body.id || `dept-${Date.now()}`;
    await db.insert(departments).values({
      id,
      name: body.name.trim().toUpperCase(),
    });

    return new Response(
      JSON.stringify({ success: true, data: { id, name: body.name.trim().toUpperCase() } }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
