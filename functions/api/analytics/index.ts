import { getDb } from "@/db/client";
import { employees, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const filterDept = url.searchParams.get("departmentId");
    const filterStatus = url.searchParams.get("status");

    const db = getDb(context.env.TURSO_DATABASE_URL, context.env.TURSO_AUTH_TOKEN);

    const allEmps = await db
      .select({
        id: employees.id,
        nik: employees.nik,
        fullName: employees.fullName,
        gender: employees.gender,
        birthDate: employees.birthDate,
        departmentId: employees.departmentId,
        departmentName: departments.name,
        position: employees.position,
        employmentStatus: employees.employmentStatus,
        joinDate: employees.joinDate,
        endContractDate: employees.endContractDate,
        isActive: employees.isActive,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id));

    // Filter if query params present
    const filteredEmps = allEmps.filter((emp: any) => {
      if (filterDept && emp.departmentId !== filterDept) return false;
      if (filterStatus && emp.employmentStatus !== filterStatus) return false;
      return true;
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    let activeCount = 0;
    let inactiveCount = 0;
    let newHiresCurrentYear = 0;

    const genderStats: Record<string, number> = { "LAKI-LAKI": 0, PEREMPUAN: 0 };
    const ageBrackets = {
      "< 25 Thn": 0,
      "25 - 34 Thn": 0,
      "35 - 44 Thn": 0,
      "45 - 54 Thn": 0,
      "55+ Thn": 0,
    };
    const tenureBrackets = {
      "< 1 Tahun": 0,
      "1 - 3 Tahun": 0,
      "3 - 5 Tahun": 0,
      "> 5 Tahun": 0,
    };
    const departmentStats: Record<string, number> = {};
    const statusStats: Record<string, number> = {
      TETAP: 0,
      KONTRAK: 0,
      HARIAN: 0,
      MAGANG: 0,
    };

    const expiringContracts30: any[] = [];
    const expiringContracts60: any[] = [];

    for (const emp of filteredEmps) {
      if (emp.isActive) {
        activeCount++;

        // Gender
        if (emp.gender === "PEREMPUAN") genderStats["PEREMPUAN"]++;
        else genderStats["LAKI-LAKI"]++;

        // Status
        if (statusStats[emp.employmentStatus] !== undefined) {
          statusStats[emp.employmentStatus]++;
        } else {
          statusStats[emp.employmentStatus] = 1;
        }

        // Department
        const dName = emp.departmentName || "Unassigned";
        departmentStats[dName] = (departmentStats[dName] || 0) + 1;

        // Age calculation
        if (emp.birthDate) {
          const bDate = new Date(emp.birthDate);
          const age = Math.floor(
            (now.getTime() - bDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          );
          if (age < 25) ageBrackets["< 25 Thn"]++;
          else if (age <= 34) ageBrackets["25 - 34 Thn"]++;
          else if (age <= 44) ageBrackets["35 - 44 Thn"]++;
          else if (age <= 54) ageBrackets["45 - 54 Thn"]++;
          else ageBrackets["55+ Thn"]++;
        }

        // Tenure calculation
        if (emp.joinDate) {
          const jDate = new Date(emp.joinDate);
          const tenureYears =
            (now.getTime() - jDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          if (tenureYears < 1) tenureBrackets["< 1 Tahun"]++;
          else if (tenureYears <= 3) tenureBrackets["1 - 3 Tahun"]++;
          else if (tenureYears <= 5) tenureBrackets["3 - 5 Tahun"]++;
          else tenureBrackets["> 5 Tahun"]++;

          if (jDate.getFullYear() === currentYear) {
            newHiresCurrentYear++;
          }
        }

        // Expiring Contracts (< 60 days)
        if (emp.endContractDate && emp.employmentStatus === "KONTRAK") {
          const endDate = new Date(emp.endContractDate);
          const diffDays = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays >= 0 && diffDays <= 60) {
            const item = {
              id: emp.id,
              nik: emp.nik,
              fullName: emp.fullName,
              position: emp.position,
              departmentName: emp.departmentName,
              endContractDate: emp.endContractDate,
              daysLeft: diffDays,
            };

            if (diffDays <= 30) {
              expiringContracts30.push(item);
            } else {
              expiringContracts60.push(item);
            }
          }
        }
      } else {
        inactiveCount++;
      }
    }

    const totalHeadcount = activeCount + inactiveCount;
    const turnoverRate =
      totalHeadcount > 0
        ? ((inactiveCount / totalHeadcount) * 100).toFixed(1)
        : "0.0";

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          metrics: {
            activeHeadcount: activeCount,
            newHiresCurrentYear,
            turnoverRate: `${turnoverRate}%`,
            expiringUnder30Count: expiringContracts30.length,
            expiringUnder60Count: expiringContracts60.length,
            totalExpiring: expiringContracts30.length + expiringContracts60.length,
          },
          charts: {
            genderDistribution: [
              { name: "Laki-laki", value: genderStats["LAKI-LAKI"], color: "#4F46E5" },
              { name: "Perempuan", value: genderStats["PEREMPUAN"], color: "#EC4899" },
            ],
            agePyramid: Object.entries(ageBrackets).map(([key, count]) => ({
              bracket: key,
              count,
            })),
            tenureDistribution: Object.entries(tenureBrackets).map(([key, count]) => ({
              tenure: key,
              count,
            })),
            departmentBreakdown: Object.entries(departmentStats).map(([name, count]) => ({
              department: name,
              count,
            })),
            employmentStatus: Object.entries(statusStats).map(([status, count]) => ({
              status,
              count,
            })),
          },
          alerts: {
            expiring30Days: expiringContracts30.sort((a, b) => a.daysLeft - b.daysLeft),
            expiring60Days: expiringContracts60.sort((a, b) => a.daysLeft - b.daysLeft),
          },
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
