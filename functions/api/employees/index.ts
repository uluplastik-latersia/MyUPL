import { getDb } from "@/db/client";
import { employees, departments } from "@/db/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
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
  employmentStatus: z.enum(["PKWT", "PKWTT", "TETAP", "KONTRAK", "HARIAN", "MAGANG"]),
  salary: z.number().optional().nullable(),
  payrollSystem: z.enum(["Harian", "Borongan", "Bulanan"]).optional().nullable(),
  bpjsKesehatan: z.enum(["BP PEMDA", "PBPU", "PBI JK", "NON"]).optional().nullable(),
  bpjsKetenagakerjaan: z.enum(["AKTIF", "NON AKTIF"]).optional().nullable(),
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
        salary: employees.salary,
        payrollSystem: employees.payrollSystem,
        bpjsKesehatan: employees.bpjsKesehatan,
        bpjsKetenagakerjaan: employees.bpjsKetenagakerjaan,
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

function normalizeDateToIso(raw: any): string {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed === "null") return "";

  // If 5-digit Excel serial number (e.g. 44561)
  if (/^\d{5}$/.test(trimmed)) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + Number(trimmed) * 86400000);
    return date.toISOString().split("T")[0];
  }

  // If YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // If DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY or D-M-YYYY
  const parts = trimmed.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else {
      // DD/MM/YYYY
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      let y = parts[2];
      if (y.length === 2) {
        y = (Number(y) > 50 ? "19" : "20") + y;
      }
      return `${y}-${m}-${d}`;
    }
  }

  return trimmed;
}

function cleanIdNumber(val: any): string {
  if (!val) return "";
  let s = String(val).trim().replace(/^['"=]+|['"]+$/g, "");
  if (/^[0-9]+(\.[0-9]+)?e\+[0-9]+$/i.test(s)) {
    try {
      const num = Number(s);
      s = BigInt(Math.round(num)).toString();
    } catch {
      // fallback
    }
  }
  return s.replace(/\D/g, "");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const rawBody = (await context.request.json()) as any;

    // Normalize incoming payload fields
    if (rawBody.birthDate) {
      rawBody.birthDate = normalizeDateToIso(rawBody.birthDate);
    }
    if (rawBody.joinDate) {
      rawBody.joinDate = normalizeDateToIso(rawBody.joinDate);
    }
    if (rawBody.endContractDate) {
      rawBody.endContractDate = normalizeDateToIso(rawBody.endContractDate);
    } else {
      rawBody.endContractDate = "";
    }
    if (rawBody.nik) {
      rawBody.nik = cleanIdNumber(rawBody.nik);
    }
    if (rawBody.noKk) {
      rawBody.noKk = cleanIdNumber(rawBody.noKk);
    }
    if (rawBody.salary !== undefined && rawBody.salary !== null) {
      const num =
        typeof rawBody.salary === "string"
          ? parseFloat(rawBody.salary.replace(/[^0-9.]/g, ""))
          : Number(rawBody.salary);
      rawBody.salary = isNaN(num) ? 0 : num;
    }

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

    // Resolve department ID if department name or slug was provided
    let deptId = data.departmentId;
    const allDepts = await db.select().from(departments);
    const foundDept = allDepts.find(
      (d) =>
        d.id.toLowerCase() === deptId.toLowerCase() ||
        d.name.toUpperCase() === deptId.toUpperCase() ||
        d.id.replace("dept-", "").toUpperCase() === deptId.toUpperCase()
    );
    if (foundDept) {
      deptId = foundDept.id;
    }

    // Verify NIK uniqueness; if exists, perform UPSERT update
    const existing = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.nik, data.nik))
      .limit(1);

    if (existing.length > 0) {
      const existingId = existing[0].id;
      await db
        .update(employees)
        .set({
          noKk: data.noKk || null,
          fullName: data.fullName.toUpperCase().trim(),
          gender: data.gender,
          birthPlace: data.birthPlace?.toUpperCase().trim() || null,
          birthDate: data.birthDate,
          address: data.address?.toUpperCase().trim() || null,
          religion: data.religion?.toUpperCase().trim() || null,
          maritalStatus: data.maritalStatus?.toUpperCase().trim() || null,
          departmentId: deptId,
          position: data.position.toUpperCase().trim(),
          employmentStatus: data.employmentStatus,
          salary:
            data.salary !== undefined && data.salary !== null
              ? Number(data.salary)
              : null,
          payrollSystem: data.payrollSystem || null,
          bpjsKesehatan: data.bpjsKesehatan || null,
          bpjsKetenagakerjaan: data.bpjsKetenagakerjaan || null,
          joinDate: data.joinDate,
          endContractDate: data.employmentStatus === "PKWTT" ? null : (data.endContractDate || null),
          isActive: data.isActive ?? true,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(employees.id, existingId));

      return new Response(
        JSON.stringify({
          success: true,
          message: "Data karyawan berhasil diperbarui (NIK sudah ada)",
          id: existingId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
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
      departmentId: deptId,
      position: data.position.toUpperCase().trim(),
      employmentStatus: data.employmentStatus,
      salary: data.salary !== undefined && data.salary !== null ? Number(data.salary) : null,
      payrollSystem: data.payrollSystem || null,
      bpjsKesehatan: data.bpjsKesehatan || null,
      bpjsKetenagakerjaan: data.bpjsKetenagakerjaan || null,
      joinDate: data.joinDate,
      endContractDate: data.employmentStatus === "PKWTT" ? null : (data.endContractDate || null),
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
