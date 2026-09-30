import { getDb } from "@/db/client";
import { employees, departments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    const record = await db
      .select({
        id: employees.id,
        nik: employees.nik,
        noKk: employees.noKk,
        fullName: employees.fullName,
        gender: employees.gender,
        birthPlace: employees.birthPlace,
        birthDate: employees.birthDate,
        address: employees.address,
        religion: employees.religion,
        maritalStatus: employees.maritalStatus,
        departmentId: employees.departmentId,
        departmentName: departments.name,
        position: employees.position,
        employmentStatus: employees.employmentStatus,
        joinDate: employees.joinDate,
        endContractDate: employees.endContractDate,
        isActive: employees.isActive,
        ktpImageBase64OrUrl: employees.ktpImageBase64OrUrl,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(employees.id, id))
      .limit(1);

    if (record.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Employee not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: record[0] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    const body = await context.request.json() as any;
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    await db
      .update(employees)
      .set({
        fullName: body.fullName ? body.fullName.toUpperCase().trim() : undefined,
        noKk: body.noKk || undefined,
        gender: body.gender || undefined,
        birthPlace: body.birthPlace ? body.birthPlace.toUpperCase().trim() : undefined,
        birthDate: body.birthDate || undefined,
        address: body.address ? body.address.toUpperCase().trim() : undefined,
        religion: body.religion ? body.religion.toUpperCase().trim() : undefined,
        maritalStatus: body.maritalStatus ? body.maritalStatus.toUpperCase().trim() : undefined,
        departmentId: body.departmentId || undefined,
        position: body.position ? body.position.toUpperCase().trim() : undefined,
        employmentStatus: body.employmentStatus || undefined,
        joinDate: body.joinDate || undefined,
        endContractDate: body.endContractDate !== undefined ? (body.endContractDate || null) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        ktpImageBase64OrUrl: body.ktpImageBase64OrUrl || undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(employees.id, id));

    return new Response(JSON.stringify({ success: true, message: "Employee updated successfully." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    await db.delete(employees).where(eq(employees.id, id));

    return new Response(JSON.stringify({ success: true, message: "Employee removed successfully." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
