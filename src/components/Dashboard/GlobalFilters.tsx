import React from "react";
import { Filter, RotateCcw, Calendar, Building2, Briefcase } from "lucide-react";
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
    <div className="glass-panel rounded-xl p-4 border-slate-800 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Filter Analitik HR</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Department Filter */}
        <div className="relative min-w-[180px]">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
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
        <div className="relative min-w-[150px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">Semua Status Kerja</option>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
