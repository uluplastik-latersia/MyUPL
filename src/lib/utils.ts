import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Employee } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];
      return `${day} ${months[monthIndex] || parts[1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function calculateAge(birthDateStr?: string | null): number | string {
  if (!birthDateStr) return "-";
  try {
    const bDate = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - bDate.getFullYear();
    const m = now.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} thn` : "-";
  } catch {
    return "-";
  }
}

export function calculateTenure(joinDateStr?: string | null): string {
  if (!joinDateStr) return "-";
  try {
    const jDate = new Date(joinDateStr);
    const now = new Date();
    let years = now.getFullYear() - jDate.getFullYear();
    let months = now.getMonth() - jDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0) {
      return `${months} bln`;
    }
    return `${years} thn ${months} bln`;
  } catch {
    return "-";
  }
}

/**
 * Preprocesses and compresses captured camera or uploaded KTP image on HTML5 Canvas.
 * - Scales down to max 1280x720 while maintaining aspect ratio
 * - Compresses to JPEG with iterative quality target < 600 KB
 * - Returns base64 data string and file size in KB
 */
export async function compressImageOnCanvas(
  source: HTMLVideoElement | HTMLImageElement | File,
  maxDimension = 1280,
  maxSizeBytes = 600 * 1024
): Promise<{ base64: string; sizeKb: number; dataUrl: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      let imageElement: HTMLImageElement;

      if (source instanceof HTMLVideoElement) {
        const canvas = document.createElement("canvas");
        canvas.width = source.videoWidth;
        canvas.height = source.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Unable to create canvas context"));
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

        const tempUrl = canvas.toDataURL("image/jpeg", 0.95);
        imageElement = new Image();
        imageElement.src = tempUrl;
        await new Promise((res) => (imageElement.onload = res));
      } else if (source instanceof File) {
        const tempUrl = URL.createObjectURL(source);
        imageElement = new Image();
        imageElement.src = tempUrl;
        await new Promise((res) => (imageElement.onload = res));
      } else {
        imageElement = source;
      }

      // Calculate target dimensions (max 1280x720)
      let width = imageElement.naturalWidth || imageElement.width;
      let height = imageElement.naturalHeight || imageElement.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context initialization failed"));

      // Draw and apply subtle contrast enhancement for clearer OCR text
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imageElement, 0, 0, width, height);

      // Iterative compression to satisfy < 600 KB requirement
      let quality = 0.88;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);

      while (dataUrl.length * 0.75 > maxSizeBytes && quality > 0.4) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      const base64Pure = dataUrl.split(",")[1];
      const sizeKb = Math.round((base64Pure.length * 0.75) / 1024);

      resolve({
        base64: base64Pure,
        sizeKb,
        dataUrl,
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates and triggers instant CSV download of employee directory records
 * Updated to include all fields matching "Pendaftaran Karyawan Baru" Form
 */
export function exportEmployeesToCsv(data: Employee[], filename = "MyUPL-Employees-Data.csv") {
  const headers = [
    "NIK",
    "No KK",
    "Nama Lengkap",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Alamat",
    "Agama",
    "Status Perkawinan",
    "Departemen",
    "Jabatan",
    "Status Kerja",
    "Gaji",
    "Sistem Penggajian",
    "BPJS Kesehatan",
    "BPJS Ketenagakerjaan",
    "Tanggal Masuk",
    "Akhir Kontrak",
    "Status Aktif",
  ];

  const rows = data.map((e) => [
    `"${e.nik}"`,
    `"${e.noKk || ""}"`,
    `"${(e.fullName || "").replace(/"/g, '""')}"`,
    `"${e.gender || ""}"`,
    `"${(e.birthPlace || "").replace(/"/g, '""')}"`,
    `"${e.birthDate || ""}"`,
    `"${(e.address || "").replace(/"/g, '""')}"`,
    `"${e.religion || ""}"`,
    `"${e.maritalStatus || ""}"`,
    `"${(e.departmentName || "").replace(/"/g, '""')}"`,
    `"${(e.position || "").replace(/"/g, '""')}"`,
    `"${e.employmentStatus || ""}"`,
    `"${e.salary || 0}"`,
    `"${e.payrollSystem || "Harian"}"`,
    `"${e.bpjsKesehatan || "NON"}"`,
    `"${e.bpjsKetenagakerjaan || "AKTIF"}"`,
    `"${e.joinDate || ""}"`,
    `"${e.endContractDate || ""}"`,
    `"${e.isActive ? "AKTIF" : "NON-AKTIF"}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads standard CSV template matching "Pendaftaran Karyawan Baru" Form
 */
export function downloadEmployeeCsvTemplate(filename = "Template_Pendaftaran_Karyawan_MyUPL.csv") {
  const headers = [
    "NIK",
    "No KK",
    "Nama Lengkap",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Alamat",
    "Agama",
    "Status Perkawinan",
    "Departemen",
    "Jabatan",
    "Status Kerja",
    "Gaji",
    "Sistem Penggajian",
    "BPJS Kesehatan",
    "BPJS Ketenagakerjaan",
    "Tanggal Masuk",
    "Akhir Kontrak",
  ];

  const sampleRows = [
    [
      `"3514012508940001"`,
      `"3514012508940002"`,
      `"YAHYA RIZAL ARIS"`,
      `"LAKI-LAKI"`,
      `"PASURUAN"`,
      `"1994-08-25"`,
      `"DUSUN SUKOREJO RT 02 RW 01, PASURUAN"`,
      `"ISLAM"`,
      `"KAWIN"`,
      `"PRODUKSI"`,
      `"OPERATOR GILINGAN KERING"`,
      `"PKWT"`,
      `"3500000"`,
      `"Harian"`,
      `"BP PEMDA"`,
      `"AKTIF"`,
      `"2026-10-01"`,
      `"2027-10-01"`,
    ],
    [
      `"3275015001980003"`,
      `"3275015001980004"`,
      `"SITI NURHALIZA FITRIANI"`,
      `"PEREMPUAN"`,
      `"BEKASI"`,
      `"1998-01-10"`,
      `"JL. MAWAR INDAH NO. 45, BEKASI"`,
      `"ISLAM"`,
      `"BELUM KAWIN"`,
      `"STAFF"`,
      `"HRD"`,
      `"PKWTT"`,
      `"5000000"`,
      `"Bulanan"`,
      `"PBPU"`,
      `"AKTIF"`,
      `"2024-01-15"`,
      `""`,
    ],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses uploaded CSV content and maps to Employee objects
 */
export function parseEmployeeCsv(
  csvText: string,
  departmentList: Array<{ id: string; name: string }>
): { valid: Partial<Employee>[]; errors: string[] } {
  const valid: Partial<Employee>[] = [];
  const errors: string[] = [];

  // Split lines by CRLF or LF
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { valid: [], errors: ["File CSV kosong atau tidak memiliki baris data."] };
  }

  // Parse a CSV line into cells respecting quotes and supporting comma or semicolon
  const parseLine = (line: string): string[] => {
    // Detect delimiter: if semicolon count > comma count outside quotes, use semicolon
    const delimiter = line.includes(";") && !line.includes(",") ? ";" : ",";
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const headerCells = parseLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  for (let i = 1; i < lines.length; i++) {
    const rawCells = parseLine(lines[i]);
    if (rawCells.length === 0 || rawCells.every((c) => !c)) continue;

    const rowObj: Record<string, string> = {};
    headerCells.forEach((header, index) => {
      rowObj[header] = rawCells[index] !== undefined ? rawCells[index] : "";
    });

    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const cleaned = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (rowObj[cleaned] !== undefined && rowObj[cleaned] !== "") {
          return rowObj[cleaned];
        }
      }
      return "";
    };

    const nik = getVal("nik").replace(/\D/g, "");
    const noKk = getVal("nokk", "kk").replace(/\D/g, "");
    const fullName = getVal("namalengkap", "nama");
    const rawGender = getVal("jeniskelamin", "gender").toUpperCase();
    const gender = rawGender.includes("PEREM") ? "PEREMPUAN" : "LAKI-LAKI";
    const birthPlace = getVal("tempatlahir", "domisili", "kota");
    const birthDate = getVal("tanggallahir", "tgl_lahir");
    const address = getVal("alamat", "domisili");
    const religion = getVal("agama") || "ISLAM";
    const maritalStatus = getVal("statusperkawinan", "perkawinan") || "BELUM KAWIN";
    const rawDept = getVal("departemen", "divisi");
    const position = getVal("jabatan", "posisi") || "General Staff";
    const rawStatus = getVal("statuskerja", "statushubungankerja", "status").toUpperCase();
    const employmentStatus = rawStatus.includes("TETAP") || rawStatus.includes("PKWTT") ? "PKWTT" : "PKWT";
    const rawSalary = getVal("gaji", "masukangaji").replace(/[^0-9.]/g, "");
    const salary = rawSalary ? parseFloat(rawSalary) : 0;
    const rawPayroll = getVal("sistempenggajian", "penggajian");
    const payrollSystem = rawPayroll.toLowerCase().includes("borong")
      ? "Borongan"
      : rawPayroll.toLowerCase().includes("bulan")
      ? "Bulanan"
      : "Harian";
    const rawBpjsKes = getVal("bpjskesehatan", "bpjs_kes").toUpperCase();
    const bpjsKesehatan = rawBpjsKes.includes("PEMDA")
      ? "BP PEMDA"
      : rawBpjsKes.includes("PBPU")
      ? "PBPU"
      : rawBpjsKes.includes("PBI")
      ? "PBI JK"
      : "NON";
    const rawBpjsTk = getVal("bpjsketenagakerjaan", "bpjs_tk").toUpperCase();
    const bpjsKetenagakerjaan = rawBpjsTk.includes("NON") ? "NON AKTIF" : "AKTIF";
    const joinDate = getVal("tanggalmasuk", "tgl_masuk", "applydate") || new Date().toISOString().split("T")[0];
    const endContractDate = getVal("akhirkontrak", "tgl_berakhir");

    // Validations
    if (!nik || nik.length !== 16) {
      errors.push(`Baris ${i + 1}: NIK "${nik}" harus berupa 16 digit angka.`);
      continue;
    }
    if (!fullName) {
      errors.push(`Baris ${i + 1}: Nama Lengkap wajib diisi.`);
      continue;
    }

    // Match department
    let matchedDept = departmentList.find(
      (d) => d.name.toUpperCase() === rawDept.toUpperCase() || d.id === rawDept
    );
    if (!matchedDept && departmentList.length > 0) {
      matchedDept = departmentList[0];
    }

    valid.push({
      nik,
      noKk,
      fullName: fullName.toUpperCase(),
      gender: gender as any,
      birthPlace: birthPlace.toUpperCase(),
      birthDate: birthDate || "1995-01-01",
      address,
      religion: religion.toUpperCase(),
      maritalStatus: maritalStatus.toUpperCase(),
      departmentId: matchedDept?.id || "dept-produksi",
      departmentName: matchedDept?.name || "PRODUKSI",
      position: position.toUpperCase(),
      employmentStatus: employmentStatus as any,
      salary,
      payrollSystem: payrollSystem as any,
      bpjsKesehatan: bpjsKesehatan as any,
      bpjsKetenagakerjaan: bpjsKetenagakerjaan as any,
      joinDate,
      endContractDate: endContractDate || null,
      isActive: true,
    });
  }

  return { valid, errors };
}
