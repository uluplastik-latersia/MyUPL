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
 */
export function exportEmployeesToCsv(data: Employee[], filename = "MyUPL-Employees-Data.csv") {
  const headers = [
    "NIK",
    "No KK",
    "Nama Lengkap",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Departemen",
    "Jabatan",
    "Status Kerja",
    "Tanggal Masuk",
    "Akhir Kontrak",
    "Status Aktif",
    "Alamat",
    "Agama",
    "Status Perkawinan",
  ];

  const rows = data.map((e) => [
    `"${e.nik}"`,
    `"${e.noKk || ""}"`,
    `"${e.fullName}"`,
    `"${e.gender}"`,
    `"${e.birthPlace || ""}"`,
    `"${e.birthDate}"`,
    `"${e.departmentName || ""}"`,
    `"${e.position}"`,
    `"${e.employmentStatus}"`,
    `"${e.joinDate}"`,
    `"${e.endContractDate || ""}"`,
    `"${e.isActive ? "AKTIF" : "NON-AKTIF"}"`,
    `"${(e.address || "").replace(/"/g, '""')}"`,
    `"${e.religion || ""}"`,
    `"${e.maritalStatus || ""}"`,
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
