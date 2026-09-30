import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { Department } from "../../types";

interface GlobalFiltersProps {
  departments: Department[];
  selectedDepartment: string;
  setSelectedDepartment: (id: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onReset: () => void;
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  selectedStatus,
  setSelectedStatus,
  onReset,
}) => {
  const isFiltered = Boolean(selectedDepartment || selectedStatus);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>Filter Data Analitik</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Department Filter */}
        <div className="relative min-w-[190px]">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
          >
            <option value="">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Status Filter */}
        <div className="relative min-w-[170px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
          >
            <option value="">Semua Hubungan Kerja</option>
            <option value="TETAP">PKWTT (Tetap)</option>
            <option value="KONTRAK">PKWT (Kontrak)</option>
            <option value="HARIAN">Harian Lepas</option>
            <option value="MAGANG">Magang / Intern</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
