import { getDb } from "@/db/client";
import { departments, employees } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

const INITIAL_DEPARTMENTS = [
  { id: "dept-ops", name: "OPERATIONS & LOGISTICS" },
  { id: "dept-eng", name: "ENGINEERING & IT" },
  { id: "dept-hr", name: "HUMAN RESOURCES & GA" },
  { id: "dept-fin", name: "FINANCE & ACCOUNTING" },
  { id: "dept-mkt", name: "SALES & MARKETING" },
  { id: "dept-prod", name: "PRODUCTION & QC" },
];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    // 1. Seed Departments
    for (const d of INITIAL_DEPARTMENTS) {
      const exists = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, d.id))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(departments).values(d);
      }
    }

    // 2. Sample Indonesian Employees
    const sampleEmployees = [
      {
        id: "emp-001",
        nik: "3171012508940001",
        noKk: "3171011502120005",
        fullName: "BAMBANG SUDIRO PRASETYO",
        gender: "LAKI-LAKI" as const,
        birthPlace: "JAKARTA",
        birthDate: "1994-08-25",
        address: "JL. CEMPAKA PUTIH TENGAH NO. 14, RT 003/RW 005, CEMPAKA PUTIH, JAKARTA PUSAT",
        religion: "ISLAM",
        maritalStatus: "KAWIN",
        departmentId: "dept-eng",
        position: "SENIOR FULL-STACK DEVELOPER",
        employmentStatus: "TETAP" as const,
        joinDate: "2021-03-01",
        endContractDate: null,
        isActive: true,
      },
      {
        id: "emp-002",
        nik: "3275024410970002",
        noKk: "3275020109150008",
        fullName: "SITI NURHALIZA FITRIANI",
        gender: "PEREMPUAN" as const,
        birthPlace: "BEKASI",
        birthDate: "1997-10-04",
        address: "KOMPLEK PONDOK GEDE PERMAI BLOK C4 NO. 8, JATIASIH, BEKASI",
        religion: "ISLAM",
        maritalStatus: "BELUM KAWIN",
        departmentId: "dept-hr",
        position: "TALENT ACQUISITION SPECIALIST",
        employmentStatus: "TETAP" as const,
        joinDate: "2022-06-15",
        endContractDate: null,
        isActive: true,
      },
      {
        id: "emp-003",
        nik: "3374031201990003",
        noKk: "3374030404160002",
        fullName: "ANDI WIJAYA KUSUMA",
        gender: "LAKI-LAKI" as const,
        birthPlace: "SEMARANG",
        birthDate: "1999-01-12",
        address: "JL. GAJAHMADA NO. 88, KEMIJEN, SEMARANG TIMUR",
        religion: "KRISTEN",
        maritalStatus: "BELUM KAWIN",
        departmentId: "dept-ops",
        position: "LOGISTICS COORDINATOR",
        employmentStatus: "KONTRAK" as const,
        joinDate: "2024-04-01",
        endContractDate: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0], // Expiring in 18 days
        isActive: true,
      },
      {
        id: "emp-004",
        nik: "3578045506000004",
        noKk: "3578041008180009",
        fullName: "DEWI AYU LESTARI",
        gender: "PEREMPUAN" as const,
        birthPlace: "SURABAYA",
        birthDate: "2000-06-15",
        address: "JL. DHARMAHUSADA INDAH UTARA II NO. 12, GUBENG, SURABAYA",
        religion: "ISLAM",
        maritalStatus: "BELUM KAWIN",
        departmentId: "dept-mkt",
        position: "DIGITAL MARKETING ASSOCIATE",
        employmentStatus: "KONTRAK" as const,
        joinDate: "2024-05-10",
        endContractDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0], // Expiring in 45 days
        isActive: true,
      },
      {
        id: "emp-005",
        nik: "3174052002880005",
        noKk: "3174050201110003",
        fullName: "HENDRA GUNAWAN",
        gender: "LAKI-LAKI" as const,
        birthPlace: "BANDUNG",
        birthDate: "1988-02-20",
        address: "JL. TEBET TIMUR DALAM VII NO. 20, TEBET, JAKARTA SELATAN",
        religion: "BUDDHA",
        maritalStatus: "KAWIN",
        departmentId: "dept-fin",
        position: "FINANCE CONTROLLER",
        employmentStatus: "TETAP" as const,
        joinDate: "2019-01-10",
        endContractDate: null,
        isActive: true,
      },
      {
        id: "emp-006",
        nik: "3204060803020006",
        noKk: "3204061205190001",
        fullName: "RIZKY RAMADHAN",
        gender: "LAKI-LAKI" as const,
        birthPlace: "SOREANG",
        birthDate: "2002-03-08",
        address: "JL. RAYA BANJARAN KM 14 NO. 45, KAB. BANDUNG",
        religion: "ISLAM",
        maritalStatus: "BELUM KAWIN",
        departmentId: "dept-prod",
        position: "QC TECHNICIAN",
        employmentStatus: "HARIAN" as const,
        joinDate: "2024-08-01",
        endContractDate: null,
        isActive: true,
      },
      {
        id: "emp-007",
        nik: "3172076012010007",
        noKk: "3172071109170004",
        fullName: "NURUL HIDAYAH",
        gender: "PEREMPUAN" as const,
        birthPlace: "JAKARTA",
        birthDate: "2001-12-20",
        address: "JL. SUNTER KARYA UTARA BLOK G NO. 7, TANJUNG PRIOK, JAKARTA UTARA",
        religion: "ISLAM",
        maritalStatus: "BELUM KAWIN",
        departmentId: "dept-eng",
        position: "FRONTEND INTERN",
        employmentStatus: "MAGANG" as const,
        joinDate: "2025-01-05",
        endContractDate: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0],
        isActive: true,
      },
    ];

    let inserted = 0;
    for (const emp of sampleEmployees) {
      const exists = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.nik, emp.nik))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(employees).values(emp);
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Database successfully seeded with departments and ${inserted} sample employees.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
