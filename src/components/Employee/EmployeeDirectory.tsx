import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import type { Employee, Department } from "../../types";
import { formatDateIndo, calculateAge, calculateTenure, exportEmployeesToCsv } from "../../lib/utils";

interface EmployeeDirectoryProps {
  employees: Employee[];
  departments: Department[];
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string, name: string) => void;
  onAddNew: () => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  departments,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTenure, setSelectedTenure] = useState("");
  const [selectedActive, setSelectedActive] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Employee>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [density, setDensity] = useState<"compact" | "normal">("compact");
  const [copiedNik, setCopiedNik] = useState<string | null>(null);

  // Copy NIK helper
  const handleCopyNik = (nik: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nik);
    setCopiedNik(nik);
    setTimeout(() => setCopiedNik(null), 2000);
  };

  // Quick Counts
  const counts = useMemo(() => {
    return {
      total: employees.length,
      tetap: employees.filter((e) => e.employmentStatus === "TETAP").length,
      kontrak: employees.filter((e) => e.employmentStatus === "KONTRAK").length,
      harian: employees.filter((e) => e.employmentStatus === "HARIAN").length,
      magang: employees.filter((e) => e.employmentStatus === "MAGANG").length,
    };
  }, [employees]);

  // Filtered and Sorted Data
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      const s = searchTerm.toLowerCase();
      const matchSearch =
        emp.fullName.toLowerCase().includes(s) ||
        emp.nik.includes(s) ||
        (emp.position && emp.position.toLowerCase().includes(s)) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(s));

      if (!matchSearch) return false;

      // Department
      if (selectedDept && emp.departmentId !== selectedDept) return false;

      // Status
      if (selectedStatus && emp.employmentStatus !== selectedStatus) return false;

      // Active
      if (selectedActive === "active" && !emp.isActive) return false;
      if (selectedActive === "inactive" && emp.isActive) return false;

      // Tenure
      if (selectedTenure && emp.joinDate) {
        const jDate = new Date(emp.joinDate);
        const years = (Date.now() - jDate.getTime()) / (365.25 * 86400000);
        if (selectedTenure === "under1" && years >= 1) return false;
        if (selectedTenure === "1to3" && (years < 1 || years > 3)) return false;
        if (selectedTenure === "3to5" && (years <= 3 || years > 5)) return false;
        if (selectedTenure === "over5" && years <= 5) return false;
      }

      return true;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus, selectedTenure, selectedActive]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEmployees.slice(start, start + itemsPerPage);
  }, [sortedEmployees, currentPage, itemsPerPage]);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDept("");
    setSelectedStatus("");
    setSelectedTenure("");
    setSelectedActive("all");
    setCurrentPage(1);
  };

  const isFiltered = Boolean(
    searchTerm || selectedDept || selectedStatus || selectedTenure || selectedActive !== "all"
  );

  return (
    <div className="space-y-4">
      {/* Top Quick Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => {
            setSelectedStatus("");
            setCurrentPage(1);
          }}
          className={`glass-panel p-3 rounded-xl border cursor-pointer transition ${
            !selectedStatus
              ? "border-indigo-500/50 bg-indigo-500/[0.06]"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Karyawan</span>
          <span className="text-xl font-extrabold text-white mt-0.5 block">{counts.total}</span>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("TETAP");
            setCurrentPage(1);
          }}
          className={`glass-panel p-3 rounded-xl border cursor-pointer transition ${
            selectedStatus === "TETAP"
              ? "border-indigo-500/50 bg-indigo-500/[0.06]"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-indigo-400 block">PKWTT (Tetap)</span>
          <span className="text-xl font-extrabold text-indigo-200 mt-0.5 block">{counts.tetap}</span>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("KONTRAK");
            setCurrentPage(1);
          }}
          className={`glass-panel p-3 rounded-xl border cursor-pointer transition ${
            selectedStatus === "KONTRAK"
              ? "border-amber-500/50 bg-amber-500/[0.06]"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-400 block">PKWT (Kontrak)</span>
          <span className="text-xl font-extrabold text-amber-200 mt-0.5 block">{counts.kontrak}</span>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("HARIAN");
            setCurrentPage(1);
          }}
          className={`glass-panel p-3 rounded-xl border cursor-pointer transition ${
            selectedStatus === "HARIAN"
              ? "border-cyan-500/50 bg-cyan-500/[0.06]"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">Harian Lepas</span>
          <span className="text-xl font-extrabold text-cyan-200 mt-0.5 block">{counts.harian}</span>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("MAGANG");
            setCurrentPage(1);
          }}
          className={`glass-panel p-3 rounded-xl border cursor-pointer transition ${
            selectedStatus === "MAGANG"
              ? "border-purple-500/50 bg-purple-500/[0.06]"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-purple-400 block">Magang / Intern</span>
          <span className="text-xl font-extrabold text-purple-200 mt-0.5 block">{counts.magang}</span>
        </div>
      </div>

      {/* Desktop Filter & Control Command Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari cepat NIK, Nama, Departemen, atau Jabatan..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>

          {/* Right Desktop Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Density Selector */}
            <div className="hidden sm:flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/80 text-xs">
              <button
                onClick={() => setDensity("compact")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  density === "compact"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan Rapat (Melihat lebih banyak baris)"
              >
                Kompak
              </button>
              <button
                onClick={() => setDensity("normal")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  density === "normal"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan Nyaman (Standar)"
              >
                Normal
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={() => exportEmployeesToCsv(filteredEmployees)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Unduh data dalam format CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* Add New Employee */}
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Karyawan</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80 items-center text-xs">
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Status Kerja</option>
              <option value="TETAP">PKWTT (Tetap)</option>
              <option value="KONTRAK">PKWT (Kontrak)</option>
              <option value="HARIAN">Harian Lepas</option>
              <option value="MAGANG">Magang</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTenure}
              onChange={(e) => {
                setSelectedTenure(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Masa Kerja (Tenure)</option>
              <option value="under1">&lt; 1 Tahun</option>
              <option value="1to3">1 - 3 Tahun</option>
              <option value="3to5">3 - 5 Tahun</option>
              <option value="over5">&gt; 5 Tahun</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedActive}
              onChange={(e) => {
                setSelectedActive(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Status Aktif</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Non-Aktif Saja</option>
            </select>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Desktop Data Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[680px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider shadow-sm">
              <tr>
                <th
                  onClick={() => handleSort("nik")}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>NIK KTP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("fullName")}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Karyawan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Departemen & Divisi</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th
                  onClick={() => handleSort("employmentStatus")}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status Kerja</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Masa Kerja & Usia</th>
                <th className="py-3.5 px-4">Batas Kontrak PKWT</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-indigo-400/50" />
                    <span className="font-medium text-slate-400 block text-sm">
                      Tidak ada karyawan yang cocok dengan kriteria pencarian.
                    </span>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 hover:bg-indigo-600/30 transition"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const pyClass = density === "compact" ? "py-2.5" : "py-4";
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onViewEmployee(emp)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* NIK with Copy Button */}
                      <td className={`${pyClass} px-4 font-mono font-medium text-slate-300`}>
                        <div className="flex items-center gap-1.5">
                          <span>{emp.nik}</span>
                          <button
                            onClick={(e) => handleCopyNik(emp.nik, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="Salin NIK"
                          >
                            {copiedNik === emp.nik ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name & Gender */}
                      <td className={`${pyClass} px-4`}>
                        <div className="font-bold text-white group-hover:text-indigo-300 transition">
                          {emp.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">{emp.gender}</div>
                      </td>

                      {/* Department */}
                      <td className={`${pyClass} px-4`}>
                        <div className="text-slate-200 font-semibold">
                          {emp.departmentName || "General"}
                        </div>
                      </td>

                      {/* Position */}
                      <td className={`${pyClass} px-4 text-slate-300`}>
                        {emp.position}
                      </td>

                      {/* Employment Status Badge */}
                      <td className={`${pyClass} px-4`}>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            emp.employmentStatus === "TETAP"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : emp.employmentStatus === "KONTRAK"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : emp.employmentStatus === "HARIAN"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {emp.employmentStatus}
                        </span>
                      </td>

                      {/* Tenure & Age */}
                      <td className={`${pyClass} px-4`}>
                        <div className="text-slate-200 font-medium">
                          {calculateTenure(emp.joinDate)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Usia: {calculateAge(emp.birthDate)}
                        </div>
                      </td>

                      {/* Contract End Date */}
                      <td className={`${pyClass} px-4 font-mono text-[11px] text-slate-300`}>
                        {emp.endContractDate ? (
                          <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {formatDateIndo(emp.endContractDate)}
                          </span>
                        ) : (
                          <span className="text-slate-500">Permanen</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className={`${pyClass} px-4 text-center`}>
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            emp.isActive ? "bg-emerald-400 shadow-[0_0_8px_#34D399]" : "bg-rose-500"
                          }`}
                          title={emp.isActive ? "Aktif" : "Non-Aktif"}
                        />
                      </td>

                      {/* Actions */}
                      <td className={`${pyClass} px-4 text-right`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewEmployee(emp)}
                            title="Lihat Detail Karyawan"
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditEmployee(emp)}
                            title="Edit Data"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-700 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEmployee(emp.id, emp.fullName)}
                            title="Hapus Karyawan"
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan{" "}
              <strong className="text-white">
                {paginatedEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </strong>{" "}
              -{" "}
              <strong className="text-white">
                {Math.min(currentPage * itemsPerPage, sortedEmployees.length)}
              </strong>{" "}
              dari <strong className="text-white">{sortedEmployees.length}</strong> Karyawan
            </span>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>Per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-slate-200">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
