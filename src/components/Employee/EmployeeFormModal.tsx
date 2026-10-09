import React, { useState, useEffect, useMemo } from "react";
import { X, Save, AlertCircle, Building2, User, CreditCard, DollarSign, Shield } from "lucide-react";
import type { Employee, Department, Gender, EmploymentStatus, PayrollSystem, BpjsKesehatan, BpjsKetenagakerjaan } from "../../types";
import {
  MASTER_DEPARTMENTS,
  PAYROLL_SYSTEMS,
  EMPLOYMENT_STATUSES,
  BPJS_KESEHATAN_OPTIONS,
  BPJS_KETENAGAKERJAAN_OPTIONS,
  getPositionsByDepartment,
} from "../../lib/departments";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => Promise<void>;
  departments: Department[];
  initialData?: Employee | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    nik: "",
    noKk: "",
    fullName: "",
    gender: "LAKI-LAKI",
    birthPlace: "",
    birthDate: "",
    address: "",
    religion: "ISLAM",
    maritalStatus: "BELUM KAWIN",
    departmentId: MASTER_DEPARTMENTS[0].id,
    position: MASTER_DEPARTMENTS[0].positions[0],
    employmentStatus: "PKWT",
    salary: 0,
    payrollSystem: "Harian",
    bpjsKesehatan: "NON",
    bpjsKetenagakerjaan: "AKTIF",
    joinDate: new Date().toISOString().split("T")[0],
    endContractDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get positions available for current selected department
  const currentPositions = useMemo(() => {
    return getPositionsByDepartment(formData.departmentId);
  }, [formData.departmentId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        noKk: initialData.noKk || "",
        birthPlace: initialData.birthPlace || "",
        address: initialData.address || "",
        religion: initialData.religion || "ISLAM",
        maritalStatus: initialData.maritalStatus || "BELUM KAWIN",
        employmentStatus: initialData.employmentStatus === "PKWTT" ? "PKWTT" : "PKWT",
        salary: initialData.salary || 0,
        payrollSystem: initialData.payrollSystem || "Harian",
        bpjsKesehatan: initialData.bpjsKesehatan || "NON",
        bpjsKetenagakerjaan: initialData.bpjsKetenagakerjaan || "AKTIF",
        endContractDate: initialData.endContractDate || "",
      });
    } else {
      setFormData({
        nik: "",
        noKk: "",
        fullName: "",
        gender: "LAKI-LAKI",
        birthPlace: "",
        birthDate: "",
        address: "",
        religion: "ISLAM",
        maritalStatus: "BELUM KAWIN",
        departmentId: MASTER_DEPARTMENTS[0].id,
        position: MASTER_DEPARTMENTS[0].positions[0],
        employmentStatus: "PKWT",
        salary: 0,
        payrollSystem: "Harian",
        bpjsKesehatan: "NON",
        bpjsKetenagakerjaan: "AKTIF",
        joinDate: new Date().toISOString().split("T")[0],
        endContractDate: "",
        isActive: true,
      });
    }
    setErrorMessage("");
  }, [initialData, departments, isOpen]);

  if (!isOpen) return null;

  // Handle department change & update default position
  const handleDepartmentChange = (deptId: string) => {
    const available = getPositionsByDepartment(deptId);
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      position: available[0] || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate NIK
    if (!formData.nik || formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setErrorMessage("NIK harus berupa 16 digit angka.");
      return;
    }
    if (!formData.fullName?.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.birthDate) {
      setErrorMessage("Tanggal lahir wajib diisi.");
      return;
    }
    if (!formData.departmentId) {
      setErrorMessage("Pilih departemen/divisi kerja.");
      return;
    }
    if (!formData.position?.trim()) {
      setErrorMessage("Posisi / Jabatan wajib diisi.");
      return;
    }
    if (!formData.joinDate) {
      setErrorMessage("Tanggal mulai kerja (Join Date) wajib diisi.");
      return;
    }
    if (formData.employmentStatus === "PKWT" && !formData.endContractDate) {
      setErrorMessage("Karyawan status PKWT wajib mengisi tanggal batas akhir kontrak.");
      return;
    }

    // Jika PKWTT (Tetap), pastikan endContractDate kosong/null
    const payloadToSave: Partial<Employee> = {
      ...formData,
      endContractDate: formData.employmentStatus === "PKWTT" ? null : formData.endContractDate || null,
    };

    try {
      setLoading(true);
      await onSave(payloadToSave);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {initialData ? "Edit Profil Karyawan" : "Pendaftaran Karyawan Baru"}
              </h3>
              <p className="text-xs text-slate-500">
                Formulir master data kepegawaian MyUPL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Identitas KTP */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              1. Identitas Kependudukan (KTP / KK)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nomor Induk Kependudukan (NIK) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={formData.nik || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="Contoh: 3171012508940001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nomor Kartu Keluarga (No. KK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.noKk || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, noKk: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="16 Digit No KK"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                  placeholder="Nama Lengkap Karyawan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Jenis Kelamin *
                </label>
                <select
                  value={formData.gender || "LAKI-LAKI"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as Gender })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="LAKI-LAKI">LAKI-LAKI</option>
                  <option value="PEREMPUAN">PEREMPUAN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate || ""}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ""}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value.toUpperCase() })}
                  placeholder="Kota / Kabupaten Kelahiran"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Agama</label>
                <select
                  value={formData.religion || "ISLAM"}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="ISLAM">ISLAM</option>
                  <option value="KRISTEN">KRISTEN</option>
                  <option value="KATOLIK">KATOLIK</option>
                  <option value="HINDU">HINDU</option>
                  <option value="BUDDHA">BUDDHA</option>
                  <option value="KONGHUCU">KONGHUCU</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Status Perkawinan
                </label>
                <select
                  value={formData.maritalStatus || "BELUM KAWIN"}
                  onChange={(e) =>
                    setFormData({ ...formData, maritalStatus: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="BELUM KAWIN">BELUM KAWIN</option>
                  <option value="KAWIN">KAWIN</option>
                  <option value="CERAI HIDUP">CERAI HIDUP</option>
                  <option value="CERAI MATI">CERAI MATI</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Alamat Lengkap Domisili KTP
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                  placeholder="Alamat, RT/RW, Kelurahan, Kecamatan, Kota"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Penempatan Kerja & Spesifikasi Posisi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              2. Data Penempatan & Posisi Jabatan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Departemen / Divisi (Sesuai File Upload) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Departemen / Divisi *
                </label>
                <select
                  required
                  value={formData.departmentId || MASTER_DEPARTMENTS[0].id}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {MASTER_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posisi / Jabatan (Sesuai File Upload) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Posisi / Jabatan *
                </label>
                <select
                  required
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {currentPositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Hubungan Kerja: [PKWT; PKWTT] */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Status Hubungan Kerja *
                </label>
                <select
                  value={formData.employmentStatus || "PKWT"}
                  onChange={(e) => {
                    const newStatus = e.target.value as EmploymentStatus;
                    setFormData({
                      ...formData,
                      employmentStatus: newStatus,
                      endContractDate: newStatus === "PKWTT" ? "" : formData.endContractDate,
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="PKWT">PKWT (Perjanjian Kerja Waktu Tertentu)</option>
                  <option value="PKWTT">PKWTT (Pegawai Tetap / Permanen)</option>
                </select>
              </div>

              {/* Tanggal Masuk Kerja (Join Date) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tanggal Masuk Kerja (Join Date) *
                </label>
                <input
                  type="date"
                  required
                  value={formData.joinDate || ""}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Batas Akhir Kontrak PKWT (jika PKWT) */}
              {formData.employmentStatus === "PKWT" && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-amber-600 block mb-1.5">
                    Batas Akhir Kontrak PKWT (End Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endContractDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endContractDate: e.target.value })
                    }
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Kompensasi & BPJS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              3. Penggajian & Jaminan Sosial (BPJS)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Masukan Gaji */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nominal Gaji / Upah (Rp) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.salary ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Contoh: 80000 atau 3500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Sistem Penggajian: [Harian; Borongan; Bulanan] */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Sistem Penggajian *
                </label>
                <select
                  value={formData.payrollSystem || "Harian"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payrollSystem: e.target.value as PayrollSystem,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {PAYROLL_SYSTEMS.map((sys) => (
                    <option key={sys} value={sys}>
                      {sys}
                    </option>
                  ))}
                </select>
              </div>

              {/* BPJS KESEHATAN: [BP PEMDA; PBPU; PBI JK; NON] */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  BPJS Kesehatan *
                </label>
                <select
                  value={formData.bpjsKesehatan || "NON"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bpjsKesehatan: e.target.value as BpjsKesehatan,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {BPJS_KESEHATAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* BPJS TENAGA KERJA: [AKTIF; NON AKTIF] */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  BPJS Ketenagakerjaan *
                </label>
                <select
                  value={formData.bpjsKetenagakerjaan || "AKTIF"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bpjsKetenagakerjaan: e.target.value as BpjsKetenagakerjaan,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {BPJS_KETENAGAKERJAAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Aktif Bekerja */}
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700">
                  Karyawan Masih Aktif Bekerja
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Menyimpan..." : "Simpan Karyawan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
