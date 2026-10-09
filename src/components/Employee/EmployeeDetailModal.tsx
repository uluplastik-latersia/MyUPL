import React from "react";
import { X, Calendar, User, MapPin, Building, Briefcase, FileText, CheckCircle2, Clock, Edit2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{employee.fullName}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {employee.position} • {employee.departmentName || "General"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
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
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {employee.isActive ? "● Status Aktif" : "● Non-Aktif"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {employee.employmentStatus}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Masa Kerja: {calculateTenure(employee.joinDate)}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Usia: {calculateAge(employee.birthDate)}
            </span>
          </div>

          {/* Section: Identitas Kependudukan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Identitas Kependudukan (KTP / KK)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Nomor Induk Kependudukan (NIK)</span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  {employee.nik}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Nomor Kartu Keluarga (No KK)</span>
                <span className="text-sm font-mono text-slate-700">
                  {employee.noKk || "-"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Jenis Kelamin</span>
                <span className="text-sm font-medium text-slate-800">{employee.gender}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Tempat, Tanggal Lahir</span>
                <span className="text-sm font-medium text-slate-800">
                  {employee.birthPlace || "-"}, {formatDateIndo(employee.birthDate)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Agama</span>
                <span className="text-sm font-medium text-slate-800">{employee.religion || "-"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Status Perkawinan</span>
                <span className="text-sm font-medium text-slate-800">{employee.maritalStatus || "-"}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block font-medium">Alamat Domisili KTP</span>
                <span className="text-sm text-slate-700 leading-relaxed font-medium">
                  {employee.address || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Hubungan & Masa Kerja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Status Pekerjaan & Sistem Penggajian
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Divisi / Departemen</span>
                <span className="text-sm font-bold text-slate-900">
                  {employee.departmentName || "-"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Posisi / Jabatan</span>
                <span className="text-sm font-bold text-slate-900">{employee.position}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Status Hubungan Kerja</span>
                <span className="text-sm font-bold text-blue-600">
                  {employee.employmentStatus === "PKWT"
                    ? "PKWT (Perjanjian Kerja Waktu Tertentu)"
                    : employee.employmentStatus === "PKWTT"
                    ? "PKWTT (Tetap / Permanen)"
                    : employee.employmentStatus}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Sistem Penggajian</span>
                <span className="text-sm font-semibold text-slate-800">
                  {employee.payrollSystem || "Bulanan"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Gaji / Upah</span>
                <span className="text-sm font-mono font-bold text-emerald-600">
                  {employee.salary
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(employee.salary)
                    : "Rp 0"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Tanggal Masuk (Join Date)</span>
                <span className="text-sm font-mono text-slate-800">
                  {formatDateIndo(employee.joinDate)}
                </span>
              </div>

              {employee.employmentStatus === "PKWT" && employee.endContractDate && (
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block font-medium">Akhir Masa Kontrak (PKWT)</span>
                  <span className="text-sm font-mono font-bold text-orange-600">
                    {formatDateIndo(employee.endContractDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section: BPJS & Perlindungan Tenaga Kerja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Jaminan Sosial & BPJS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">BPJS KESEHATAN</span>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {employee.bpjsKesehatan || "BP PEMDA"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">BPJS TENAGA KERJA</span>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    employee.bpjsKetenagakerjaan === "AKTIF"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {employee.bpjsKetenagakerjaan || "AKTIF"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Preview KTP Image */}
          {employee.ktpImageBase64OrUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                Dokumen Hasil Scan KTP / KK
              </h4>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-60 flex items-center justify-center p-3">
                <img
                  src={
                    employee.ktpImageBase64OrUrl.startsWith("data:")
                      ? employee.ktpImageBase64OrUrl
                      : `data:image/jpeg;base64,${employee.ktpImageBase64OrUrl}`
                  }
                  alt="Dokumen KTP"
                  className="max-h-56 object-contain rounded-xl shadow-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
