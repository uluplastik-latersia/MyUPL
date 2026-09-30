import { getDb } from "@/db/client";
import { employees, departments } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import { z } from "zod";

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

const employeeSchema = z.object({
  id: z.string().optional(),
  nik: z.string().length(16, "NIK must be exactly 16 digits").regex(/^\d+$/, "NIK must contain only numbers"),
  noKk: z.string().length(16, "No KK must be 16 digits").regex(/^\d+$/).optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(["LAKI-LAKI", "PEREMPUAN"]),
  birthPlace: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date format must be YYYY-MM-DD"),
  address: z.string().optional(),
  religion: z.string().optional(),
  maritalStatus: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  employmentStatus: z.enum(["TETAP", "KONTRAK", "HARIAN", "MAGANG"]),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Join date format must be YYYY-MM-DD"),
  endContractDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  ktpImageBase64OrUrl: z.string().optional().nullable(),
});

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const search = url.searchParams.get("search") || "";
    const departmentId = url.searchParams.get("departmentId") || "";
    const status = url.searchParams.get("status") || "";
    const activeParam = url.searchParams.get("isActive");

    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    // Query joined with department for presentation
    const baseQuery = db
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
      .leftJoin(departments, eq(employees.departmentId, departments.id));

    const conditions = [];

    if (search.trim()) {
      const s = `%${search.trim().toUpperCase()}%`;
      conditions.push(
        or(
          like(employees.fullName, s),
          like(employees.nik, s),
          like(employees.position, s)
        )
      );
    }

    if (departmentId) {
      conditions.push(eq(employees.departmentId, departmentId));
    }

    if (status) {
      conditions.push(eq(employees.employmentStatus, status as any));
    }

    if (activeParam !== null && activeParam !== undefined && activeParam !== "") {
      conditions.push(eq(employees.isActive, activeParam === "true"));
    }

    let records;
    if (conditions.length > 0) {
      records = await baseQuery.where(and(...conditions)).orderBy(desc(employees.createdAt));
    } else {
      records = await baseQuery.orderBy(desc(employees.createdAt));
    }

    return new Response(JSON.stringify({ success: true, data: records }), {
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
    const rawBody = await context.request.json();
    const validated = employeeSchema.safeParse(rawBody);

    if (!validated.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation error",
          details: validated.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = validated.data;
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    // Verify NIK uniqueness
    const existing = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.nik, data.nik))
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Employee with NIK ${data.nik} already exists in database.`,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const employeeId = data.id || `emp-${crypto.randomUUID()}`;

    await db.insert(employees).values({
      id: employeeId,
      nik: data.nik,
      noKk: data.noKk || null,
      fullName: data.fullName.toUpperCase().trim(),
      gender: data.gender,
      birthPlace: data.birthPlace?.toUpperCase().trim() || null,
      birthDate: data.birthDate,
      address: data.address?.toUpperCase().trim() || null,
      religion: data.religion?.toUpperCase().trim() || null,
      maritalStatus: data.maritalStatus?.toUpperCase().trim() || null,
      departmentId: data.departmentId,
      position: data.position.toUpperCase().trim(),
      employmentStatus: data.employmentStatus,
      joinDate: data.joinDate,
      endContractDate: data.endContractDate || null,
      isActive: data.isActive ?? true,
      ktpImageBase64OrUrl: data.ktpImageBase64OrUrl || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Employee successfully created",
        id: employeeId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
