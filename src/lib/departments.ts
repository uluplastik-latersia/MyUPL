export interface DepartmentDefinition {
  id: string;
  name: string;
  positions: string[];
}

export const MASTER_DEPARTMENTS: DepartmentDefinition[] = [
  {
    id: "dept-produksi",
    name: "PRODUKSI",
    positions: [
      "OPERATOR GILINGAN BESAR",
      "OPERATOR GILINGAN KECIL",
      "OPERATOR GILINGAN KERING",
      "LOGISTIK",
      "OPERATOR RAFIA",
      "OPERATOR PELETAN",
      "PENGOLAHAN",
      "SORTIR",
      "OPERATOR TIMBANGAN",
    ],
  },
  {
    id: "dept-staff",
    name: "STAFF",
    positions: [
      "ADMIN KEUANGAN",
      "HRD",
      "KEPALA PRODUKSI",
      "KEPALA BAGIAN GILINGAN",
      "KEPALA BAGIAN SORTIR",
      "MANAGER OPERASIONAL",
      "SUPIR",
      "KEPALA BAGIAN LOGISTIK",
    ],
  },
  {
    id: "dept-teknisi",
    name: "TEKNISI",
    positions: [
      "KEPALA MEKANIK",
      "MEKANIK",
    ],
  },
  {
    id: "dept-keamanan",
    name: "KEAMANAN",
    positions: [
      "SATPAM",
    ],
  },
  {
    id: "dept-kebersihan",
    name: "KEBERSIHAN",
    positions: [
      "KEBERSIHAN",
      "TUKANG KEBUN",
    ],
  },
];

export const PAYROLL_SYSTEMS = ["Harian", "Borongan", "Bulanan"] as const;
export const EMPLOYMENT_STATUSES = ["PKWT", "PKWTT"] as const;
export const BPJS_KESEHATAN_OPTIONS = ["BP PEMDA", "PBPU", "PBI JK", "NON"] as const;
export const BPJS_KETENAGAKERJAAN_OPTIONS = ["AKTIF", "NON AKTIF"] as const;

export function getPositionsByDepartment(deptNameOrId?: string): string[] {
  if (!deptNameOrId) return [];
  const found = MASTER_DEPARTMENTS.find(
    (d) => d.id === deptNameOrId || d.name.toUpperCase() === deptNameOrId.toUpperCase()
  );
  return found ? found.positions : [];
}
