import React from "react";
import { X, Calendar, User, Phone, MapPin, Building, Briefcase, FileText, CheckCircle2, Clock } from "lucide-react";
import type { Employee } from "../../types";
import { formatDateIndo, calculateAge, calculateTenure } from "../../lib/utils";

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
  onEdit,
}) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{employee.fullName}</h3>
              <p className="text-xs text-slate-400">
                {employee.position} • {employee.departmentName || "General"}
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

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                employee.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {employee.isActive ? "Status Aktif" : "Non-Aktif"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {employee.employmentStatus}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Masa Kerja: {calculateTenure(employee.joinDate)}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Usia: {calculateAge(employee.birthDate)}
            </span>
          </div>

          {/* Section: Identitas Kependudukan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Identitas Kependudukan (KTP / KK)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">Nomor Induk Kependudukan (NIK)</span>
                <span className="text-sm font-mono font-bold text-white tracking-wider">
                  {employee.nik}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Nomor Kartu Keluarga (No KK)</span>
                <span className="text-sm font-mono text-slate-200">
                  {employee.noKk || "-"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Jenis Kelamin</span>
                <span className="text-sm text-slate-200">{employee.gender}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Tempat, Tanggal Lahir</span>
                <span className="text-sm text-slate-200">
                  {employee.birthPlace || "-"}, {formatDateIndo(employee.birthDate)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Agama</span>
                <span className="text-sm text-slate-200">{employee.religion || "-"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Status Perkawinan</span>
                <span className="text-sm text-slate-200">{employee.maritalStatus || "-"}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block">Alamat Domisili KTP</span>
                <span className="text-sm text-slate-200 leading-relaxed">
                  {employee.address || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Hubungan & Masa Kerja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Status Pekerjaan & Kontrak
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">Divisi / Departemen</span>
                <span className="text-sm font-semibold text-white">
                  {employee.departmentName || "-"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Posisi / Jabatan</span>
                <span className="text-sm font-semibold text-white">{employee.position}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Tanggal Masuk (Join Date)</span>
                <span className="text-sm font-mono text-slate-200">
                  {formatDateIndo(employee.joinDate)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Akhir Masa Kontrak (PKWT)</span>
                <span className="text-sm font-mono text-slate-200">
                  {employee.endContractDate ? formatDateIndo(employee.endContractDate) : "Permanen (PKWTT)"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Preview KTP Image if stored */}
          {employee.ktpImageBase64OrUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                Dokumen Hasil Scan KTP / KK
              </h4>
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-60 flex items-center justify-center p-2">
                <img
                  src={
                    employee.ktpImageBase64OrUrl.startsWith("data:")
                      ? employee.ktpImageBase64OrUrl
                      : `data:image/jpeg;base64,${employee.ktpImageBase64OrUrl}`
                  }
                  alt="Dokumen KTP"
                  className="max-h-56 object-contain rounded-lg shadow"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-sm shadow-indigo-600/30"
          >
            Edit Data
          </button>
        </div>
      </div>
    </div>
  );
};
