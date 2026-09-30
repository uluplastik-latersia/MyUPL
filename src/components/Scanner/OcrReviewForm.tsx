import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Briefcase,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { z } from "zod";
import type { Department, KtpOcrResult, Gender, EmploymentStatus } from "../../types";

interface OcrReviewFormProps {
  ocrData: KtpOcrResult;
  capturedImageBase64: string;
  departments: Department[];
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

// Zod Schema matching database constraints
const reviewFormSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK wajib berupa 16 digit angka.")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka."),
  noKk: z
    .string()
    .length(16, "Nomor KK harus 16 digit angka.")
    .regex(/^\d+$/)
    .optional()
    .or(z.literal("")),
  fullName: z.string().min(2, "Nama lengkap harus diisi."),
  gender: z.enum(["LAKI-LAKI", "PEREMPUAN"]),
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi."),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir YYYY-MM-DD."),
  address: z.string().min(3, "Alamat wajib diisi."),
  religion: z.string().optional(),
  maritalStatus: z.string().optional(),
  departmentId: z.string().min(1, "Departemen penempatan wajib dipilih."),
  position: z.string().min(1, "Posisi / Jabatan wajib diisi."),
  employmentStatus: z.enum(["TETAP", "KONTRAK", "HARIAN", "MAGANG"]),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal masuk YYYY-MM-DD."),
  endContractDate: z.string().optional().nullable().or(z.literal("")),
});

export const OcrReviewForm: React.FC<OcrReviewFormProps> = ({
  ocrData,
  capturedImageBase64,
  departments,
  onCancel,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    nik: ocrData.nik || "",
    noKk: ocrData.no_kk || "",
    fullName: ocrData.nama || "",
    gender: (ocrData.jenis_kelamin === "PEREMPUAN" ? "PEREMPUAN" : "LAKI-LAKI") as Gender,
    birthPlace: ocrData.tempat_lahir || "",
    birthDate: ocrData.tanggal_lahir || "",
    address: ocrData.alamat || "",
    religion: ocrData.agama || "ISLAM",
    maritalStatus: ocrData.status_perkawinan || "BELUM KAWIN",
    departmentId: departments[0]?.id || "",
    position: ocrData.pekerjaan && ocrData.pekerjaan !== "KARYAWAN SWASTA" ? ocrData.pekerjaan : "",
    employmentStatus: "KONTRAK" as EmploymentStatus,
    joinDate: new Date().toISOString().split("T")[0],
    endContractDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const validation = reviewFormSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...validation.data,
        isActive: true,
        ktpImageBase64OrUrl: capturedImageBase64,
      };

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = (await response.json()) as any;

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Gagal menyimpan data karyawan.");
      }

      onSubmitSuccess();
    } catch (err: any) {
      setApiError(err.message || "Terjadi kesalahan saat menyimpan ke database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Verifikasi Data Hasil Pindai KTP
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Extracted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Periksa kecocokan data visual fisik KTP dengan formulir sebelum disimpan ke database
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Pindai Ulang</span>
        </button>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Side-by-Side Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Captured KTP Visual Reference (Sticky on Desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              Foto Fisik KTP Asli
            </span>
            <span className="text-[11px] text-slate-500">Resolusi WebP/JPEG</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/60 shadow-xl p-2 relative group">
            <img
              src={`data:image/jpeg;base64,${capturedImageBase64}`}
              alt="KTP Original Capture"
              className="w-full object-contain rounded-lg max-h-[360px]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <div className="font-semibold text-slate-200 mb-1">Pemeriksaan Akurasi NIK:</div>
            Pastikan NIK 16 digit pada kolom kanan sama persis dengan angka yang tertera di gambar fisik KTP.
          </div>
        </div>

        {/* Right Column: Editable & Verified Form Fields */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Identity Fields */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Data Pribadi Sesuai KTP
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NIK */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    NIK (16 Digit) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })
                    }
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white font-mono tracking-wider focus:outline-none ${
                      errors.nik
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-slate-700 focus:border-indigo-500"
                    }`}
                  />
                  {errors.nik && (
                    <span className="text-[11px] text-rose-400 block mt-1">{errors.nik}</span>
                  )}
                </div>

                {/* No KK */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nomor KK (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.noKk}
                    onChange={(e) =>
                      setFormData({ ...formData, noKk: e.target.value.replace(/\D/g, "") })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-rose-400 block mt-1">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as Gender })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LAKI-LAKI">LAKI-LAKI</option>
                    <option value="PEREMPUAN">PEREMPUAN</option>
                  </select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  {errors.birthDate && (
                    <span className="text-[11px] text-rose-400 block mt-1">
                      {errors.birthDate}
                    </span>
                  )}
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tempat Lahir *
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Agama */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Agama</label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) =>
                      setFormData({ ...formData, religion: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Status Perkawinan */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Status Perkawinan
                  </label>
                  <input
                    type="text"
                    value={formData.maritalStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, maritalStatus: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alamat Lengkap KTP *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  {errors.address && (
                    <span className="text-[11px] text-rose-400 block mt-1">{errors.address}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. HR Assignment Fields */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Penempatan Kerja & Kontrak Perusahaan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Departemen */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Departemen / Divisi *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Posisi */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Posisi / Jabatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value.toUpperCase() })
                    }
                    placeholder="Contoh: Staff Gudang, Teknisi QC"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  {errors.position && (
                    <span className="text-[11px] text-rose-400 block mt-1">{errors.position}</span>
                  )}
                </div>

                {/* Status Hubungan Kerja */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Status Kontrak Kerja *
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value as EmploymentStatus,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TETAP">TETAP (PKWTT)</option>
                    <option value="KONTRAK">KONTRAK (PKWT)</option>
                    <option value="HARIAN">HARIAN LEPAS</option>
                    <option value="MAGANG">MAGANG / INTERNSHIP</option>
                  </select>
                </div>

                {/* Tanggal Masuk */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tanggal Mulai Kerja (Join Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Batas Kontrak (if Kontrak) */}
                {formData.employmentStatus === "KONTRAK" && (
                  <div>
                    <label className="text-xs font-semibold text-amber-400 block mb-1">
                      Batas Akhir Kontrak PKWT *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endContractDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, endContractDate: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Batalkan
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Menyimpan ke Turso..." : "Verifikasi & Simpan Karyawan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
