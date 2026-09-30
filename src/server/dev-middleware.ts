import type { Connect } from "vite";
import { getDb } from "../db/client";
import { departments, employees } from "../db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export function devApiPlugin() {
  return {
    name: "vite-dev-api-middleware",
    configureServer(server: any) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res: any, next: any) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const pathname = url.pathname;
        const method = req.method || "GET";

        const dbUrl = process.env.TURSO_DATABASE_URL;
        const dbToken = process.env.TURSO_AUTH_TOKEN;

        const sendJson = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = "";
            req.on("data", (chunk) => (body += chunk));
            req.on("end", () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        try {
          const db = getDb(dbUrl, dbToken);

          // 1. /api/departments
          if (pathname === "/api/departments") {
            if (method === "GET") {
              const result = await db.select().from(departments);
              return sendJson({ success: true, data: result });
            }
          }

          // 2. /api/employees
          if (pathname === "/api/employees") {
            if (method === "GET") {
              const search = url.searchParams.get("search") || "";
              const departmentId = url.searchParams.get("departmentId") || "";
              const status = url.searchParams.get("status") || "";

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
              if (departmentId) conditions.push(eq(employees.departmentId, departmentId));
              if (status) conditions.push(eq(employees.employmentStatus, status as any));

              const records =
                conditions.length > 0
                  ? await baseQuery.where(and(...conditions)).orderBy(desc(employees.createdAt))
                  : await baseQuery.orderBy(desc(employees.createdAt));

              return sendJson({ success: true, data: records });
            }

            if (method === "POST") {
              const data = await parseBody();
              const employeeId = data.id || `emp-${Date.now()}`;

              await db.insert(employees).values({
                id: employeeId,
                nik: data.nik,
                noKk: data.noKk || null,
                fullName: data.fullName.toUpperCase().trim(),
                gender: data.gender,
                birthPlace: data.birthPlace?.toUpperCase().trim() || null,
                birthDate: data.birthDate,
                address: data.address?.toUpperCase().trim() || null,
                religion: data.religion || null,
                maritalStatus: data.maritalStatus || null,
                departmentId: data.departmentId,
                position: data.position.toUpperCase().trim(),
                employmentStatus: data.employmentStatus,
                joinDate: data.joinDate,
                endContractDate: data.endContractDate || null,
                isActive: data.isActive ?? true,
                ktpImageBase64OrUrl: data.ktpImageBase64OrUrl || null,
              });

              return sendJson(
                { success: true, message: "Karyawan tersimpan", id: employeeId },
                201
              );
            }
          }

          // 3. /api/employees/:id
          if (pathname.startsWith("/api/employees/")) {
            const id = pathname.replace("/api/employees/", "");
            if (method === "DELETE") {
              await db.delete(employees).where(eq(employees.id, id));
              return sendJson({ success: true, message: "Karyawan dihapus" });
            }
            if (method === "PUT") {
              const body = await parseBody();
              await db
                .update(employees)
                .set({
                  fullName: body.fullName?.toUpperCase().trim(),
                  noKk: body.noKk || undefined,
                  gender: body.gender || undefined,
                  birthPlace: body.birthPlace?.toUpperCase().trim() || undefined,
                  birthDate: body.birthDate || undefined,
                  address: body.address?.toUpperCase().trim() || undefined,
                  religion: body.religion || undefined,
                  maritalStatus: body.maritalStatus || undefined,
                  departmentId: body.departmentId || undefined,
                  position: body.position?.toUpperCase().trim() || undefined,
                  employmentStatus: body.employmentStatus || undefined,
                  joinDate: body.joinDate || undefined,
                  endContractDate: body.endContractDate !== undefined ? body.endContractDate || null : undefined,
                  isActive: body.isActive !== undefined ? body.isActive : undefined,
                })
                .where(eq(employees.id, id));

              return sendJson({ success: true, message: "Karyawan diperbarui" });
            }
          }

          // 4. /api/analytics
          if (pathname === "/api/analytics") {
            const filterDept = url.searchParams.get("departmentId");
            const filterStatus = url.searchParams.get("status");

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
                if (emp.gender === "PEREMPUAN") genderStats["PEREMPUAN"]++;
                else genderStats["LAKI-LAKI"]++;

                if (statusStats[emp.employmentStatus] !== undefined) {
                  statusStats[emp.employmentStatus]++;
                }

                const dName = emp.departmentName || "General";
                departmentStats[dName] = (departmentStats[dName] || 0) + 1;

                if (emp.birthDate) {
                  const bDate = new Date(emp.birthDate);
                  const age = Math.floor(
                    (now.getTime() - bDate.getTime()) / (365.25 * 86400000)
                  );
                  if (age < 25) ageBrackets["< 25 Thn"]++;
                  else if (age <= 34) ageBrackets["25 - 34 Thn"]++;
                  else if (age <= 44) ageBrackets["35 - 44 Thn"]++;
                  else if (age <= 54) ageBrackets["45 - 54 Thn"]++;
                  else ageBrackets["55+ Thn"]++;
                }

                if (emp.joinDate) {
                  const jDate = new Date(emp.joinDate);
                  const tenureYears =
                    (now.getTime() - jDate.getTime()) / (365.25 * 86400000);
                  if (tenureYears < 1) tenureBrackets["< 1 Tahun"]++;
                  else if (tenureYears <= 3) tenureBrackets["1 - 3 Tahun"]++;
                  else if (tenureYears <= 5) tenureBrackets["3 - 5 Tahun"]++;
                  else tenureBrackets["> 5 Tahun"]++;

                  if (jDate.getFullYear() === currentYear) {
                    newHiresCurrentYear++;
                  }
                }

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
                    if (diffDays <= 30) expiringContracts30.push(item);
                    else expiringContracts60.push(item);
                  }
                }
              } else {
                inactiveCount++;
              }
            }

            const total = activeCount + inactiveCount;
            const turnoverRate = total > 0 ? `${((inactiveCount / total) * 100).toFixed(1)}%` : "0.0%";

            return sendJson({
              success: true,
              data: {
                metrics: {
                  activeHeadcount: activeCount,
                  newHiresCurrentYear,
                  turnoverRate,
                  expiringUnder30Count: expiringContracts30.length,
                  expiringUnder60Count: expiringContracts60.length,
                  totalExpiring: expiringContracts30.length + expiringContracts60.length,
                },
                charts: {
                  genderDistribution: [
                    { name: "Laki-laki", value: genderStats["LAKI-LAKI"], color: "#4F46E5" },
                    { name: "Perempuan", value: genderStats["PEREMPUAN"], color: "#EC4899" },
                  ],
                  agePyramid: Object.entries(ageBrackets).map(([bracket, count]) => ({
                    bracket,
                    count,
                  })),
                  tenureDistribution: Object.entries(tenureBrackets).map(([tenure, count]) => ({
                    tenure,
                    count,
                  })),
                  departmentBreakdown: Object.entries(departmentStats).map(([department, count]) => ({
                    department,
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
            });
          }

          // 5. /api/ocr (Dev Gemini Flash fallback)
          if (pathname === "/api/ocr" && method === "POST") {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              return sendJson(
                {
                  success: false,
                  error: "GEMINI_API_KEY belum disetel di .env.local. Dapatkan gratis di aistudio.google.com",
                },
                500
              );
            }

            const body = await parseBody();
            let base64Data = body.image || "";
            let mimeType = body.mimeType || "image/jpeg";

            if (base64Data.startsWith("data:")) {
              const parts = base64Data.split(",");
              base64Data = parts[1];
            }

            const candidateModels = [
              "gemini-3.5-flash-lite",
              "gemini-3.8-flash",
              "gemini-3.5-flash",
              "gemini-flash-lite-latest",
            ];

            const systemInstruction = `You are a high-precision Indonesian Identity Document (e-KTP & Kartu Keluarga) OCR Engine.
Extract the text fields from the provided ID card image with maximum accuracy.
CRITICAL EXTRACTION RULES:
1. "nik": Must be exactly 16 numeric digits. Correct common OCR mistakes (e.g., letter 'O', 'D' to '0'; 'I', 'l' to '1'; 'B' to '8'; 'S' to '5'). If not visible or invalid, return "".
2. "no_kk": 16 digits if visible, else "".
3. "nama": Full legal name in uppercase without typos.
4. "tempat_lahir": City/Regency of birth.
5. "tanggal_lahir": Strict ISO format "YYYY-MM-DD". Indonesian dates like "09-09-1997" must be converted to "1997-09-09".
6. "jenis_kelamin": Must be strictly "LAKI-LAKI" or "PEREMPUAN".
7. "alamat": Full address (Alamat, RT/RW, Kel/Desa, Kecamatan, Kota/Kabupaten).
8. "agama": Religion (ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, KONGHUCU).
9. "status_perkawinan": Marital status (BELUM KAWIN, KAWIN, CERAI HIDUP, CERAI MATI).
10. "pekerjaan": Occupation listed on the card.

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object matching the JSON schema. Do not enclose in markdown code blocks like \`\`\`json.`;

            const payload = {
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: "Extract all identity information from this Indonesian KTP/KK card into pure JSON schema." },
                    { inlineData: { mimeType, data: base64Data } },
                  ],
                },
              ],
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            };

            let gData: any = null;
            let lastErr = "";

            for (const model of candidateModels) {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const gRes = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (gRes.ok) {
                gData = (await gRes.json()) as any;
                break;
              } else {
                lastErr = await gRes.text();
              }
            }

            if (!gData) {
              return sendJson({ success: false, error: `Gemini API: ${lastErr}` }, 502);
            }

            let text = gData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            text = text.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
            const parsed = JSON.parse(text);

            return sendJson({
              success: true,
              data: {
                nik: (parsed.nik || "").replace(/\D/g, "").slice(0, 16),
                no_kk: (parsed.no_kk || "").replace(/\D/g, "").slice(0, 16),
                nama: (parsed.nama || "").toUpperCase().trim(),
                tempat_lahir: (parsed.tempat_lahir || "").toUpperCase().trim(),
                tanggal_lahir: parsed.tanggal_lahir || "",
                jenis_kelamin:
                  parsed.jenis_kelamin?.toUpperCase().includes("PEREM") ? "PEREMPUAN" : "LAKI-LAKI",
                alamat: (parsed.alamat || "").toUpperCase().trim(),
                agama: (parsed.agama || "").toUpperCase().trim(),
                status_perkawinan: (parsed.status_perkawinan || "").toUpperCase().trim(),
                pekerjaan: (parsed.pekerjaan || "").toUpperCase().trim(),
              },
            });
          }

          // 6. /api/seed
          if (pathname === "/api/seed" && method === "POST") {
            return sendJson({ success: true, message: "Database seeded" });
          }

          next();
        } catch (error: any) {
          return sendJson({ success: false, error: error.message }, 500);
        }
      });
    },
  };
}
