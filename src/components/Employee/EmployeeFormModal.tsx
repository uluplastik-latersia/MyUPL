import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Building2, User, CreditCard } from "lucide-react";
import type { Employee, Department, Gender, EmploymentStatus } from "../../types";

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
    departmentId: "",
    position: "",
    employmentStatus: "TETAP",
    joinDate: new Date().toISOString().split("T")[0],
    endContractDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        noKk: initialData.noKk || "",
        birthPlace: initialData.birthPlace || "",
        address: initialData.address || "",
        religion: initialData.religion || "ISLAM",
        maritalStatus: initialData.maritalStatus || "BELUM KAWIN",
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
        departmentId: departments[0]?.id || "",
        position: "",
        employmentStatus: "TETAP",
        joinDate: new Date().toISOString().split("T")[0],
        endContractDate: "",
        isActive: true,
      });
    }
    setErrorMessage("");
  }, [initialData, departments, isOpen]);

  if (!isOpen) return null;

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

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {initialData ? "Edit Profil Karyawan" : "Pendaftaran Karyawan Baru"}
              </h3>
              <p className="text-xs text-slate-400">
                Formulir master data kepegawaian MyUPL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section: Identitas KTP */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              1. Identitas Kependudukan (KTP / KK)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nama Lengkap Karyawan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  value={formData.gender || "LAKI-LAKI"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as Gender })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LAKI-LAKI">LAKI-LAKI</option>
                  <option value="PEREMPUAN">PEREMPUAN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate || ""}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ""}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder="Kota / Kabupaten Kelahiran"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Agama</label>
                <select
                  value={formData.religion || "ISLAM"}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Status Perkawinan
                </label>
                <select
                  value={formData.maritalStatus || "BELUM KAWIN"}
                  onChange={(e) =>
                    setFormData({ ...formData, maritalStatus: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BELUM KAWIN">BELUM KAWIN</option>
                  <option value="KAWIN">KAWIN</option>
                  <option value="CERAI HIDUP">CERAI HIDUP</option>
                  <option value="CERAI MATI">CERAI MATI</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alamat Lengkap Domisili KTP
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat, RT/RW, Kelurahan, Kecamatan, Kota"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Hubungan & Penempatan Kerja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              2. Data Penempatan & Hubungan Kerja
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Departemen / Divisi *
                </label>
                <select
                  required
                  value={formData.departmentId || ""}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Pilih Departemen</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Posisi / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Misal: Senior Developer, Staff Logistik"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Status Hubungan Kerja *
                </label>
                <select
                  value={formData.employmentStatus || "TETAP"}
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

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tanggal Masuk Kerja (Join Date) *
                </label>
                <input
                  type="date"
                  required
                  value={formData.joinDate || ""}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {formData.employmentStatus === "KONTRAK" && (
                <div>
                  <label className="text-xs font-semibold text-amber-400 block mb-1">
                    Batas Akhir Kontrak PKWT (End Date) *
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

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-200">
                  Karyawan Masih Aktif Bekerja
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
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
