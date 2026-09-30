export type Gender = "LAKI-LAKI" | "PEREMPUAN";
export type EmploymentStatus = "TETAP" | "KONTRAK" | "HARIAN" | "MAGANG";

export interface Department {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  nik: string;
  noKk?: string | null;
  fullName: string;
  gender: Gender;
  birthPlace?: string | null;
  birthDate: string; // YYYY-MM-DD
  address?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  departmentId: string;
  departmentName?: string | null;
  position: string;
  employmentStatus: EmploymentStatus;
  joinDate: string; // YYYY-MM-DD
  endContractDate?: string | null; // YYYY-MM-DD
  isActive: boolean;
  ktpImageBase64OrUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpiringContractAlert {
  id: string;
  nik: string;
  fullName: string;
  position: string;
  departmentName?: string;
  endContractDate: string;
  daysLeft: number;
}

export interface AnalyticsData {
  metrics: {
    activeHeadcount: number;
    newHiresCurrentYear: number;
    turnoverRate: string;
    expiringUnder30Count: number;
    expiringUnder60Count: number;
    totalExpiring: number;
  };
  charts: {
    genderDistribution: { name: string; value: number; color: string }[];
    agePyramid: { bracket: string; count: number }[];
    tenureDistribution: { tenure: string; count: number }[];
    departmentBreakdown: { department: string; count: number }[];
    employmentStatus: { status: string; count: number }[];
  };
  alerts: {
    expiring30Days: ExpiringContractAlert[];
    expiring60Days: ExpiringContractAlert[];
  };
}

export interface KtpOcrResult {
  nik: string;
  no_kk: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "LAKI-LAKI" | "PEREMPUAN" | "";
  alamat: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
}
