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
  const [sortField, setSortField] = useState<keyof Employee>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered and Sorted Data
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      const matchSearch =
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nik.includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      // Department
      if (selectedDept && emp.departmentId !== selectedDept) return false;

      // Status
      if (selectedStatus && emp.employmentStatus !== selectedStatus) return false;

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
  }, [employees, searchTerm, selectedDept, selectedStatus, selectedTenure]);

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
  }, [sortedEmployees, currentPage]);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleExportCsv = () => {
    exportEmployeesToCsv(filteredEmployees);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters & Actions */}
      <div className="glass-panel rounded-xl p-4 border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NIK, Nama, atau Posisi..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Unduh data dalam format CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Karyawan</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
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
              <option value="">Semua Status Hubungan Kerja</option>
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
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="glass-panel rounded-xl border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort("nik")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>NIK</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("fullName")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Karyawan</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Departemen & Jabatan</th>
                <th
                  onClick={() => handleSort("employmentStatus")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status Kerja</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Masa Kerja & Usia</th>
                <th className="py-3 px-4">Akhir Kontrak</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                    <span>Tidak ada data karyawan yang cocok dengan kriteria filter.</span>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* NIK */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        {emp.nik}
                      </td>

                      {/* Name & Gender */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-400">{emp.gender}</div>
                      </td>

                      {/* Dept & Position */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">{emp.position}</div>
                        <div className="text-[11px] text-slate-400">
                          {emp.departmentName || "General"}
                        </div>
                      </td>

                      {/* Employment Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.employmentStatus === "TETAP"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : emp.employmentStatus === "KONTRAK"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          }`}
                        >
                          {emp.employmentStatus}
                        </span>
                      </td>

                      {/* Tenure & Age */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{calculateTenure(emp.joinDate)}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Usia: {calculateAge(emp.birthDate)}
                        </div>
                      </td>

                      {/* Contract End Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {emp.endContractDate ? formatDateIndo(emp.endContractDate) : "-"}
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            emp.isActive ? "bg-emerald-400" : "bg-rose-500"
                          }`}
                          title={emp.isActive ? "Aktif" : "Non-Aktif"}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewEmployee(emp)}
                            title="Lihat Detail Karyawan"
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditEmployee(emp)}
                            title="Edit Data"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-700/60 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEmployee(emp.id, emp.fullName)}
                            title="Hapus Karyawan"
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/60 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Menampilkan{" "}
            <span className="font-semibold text-white">
              {paginatedEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-white">
              {Math.min(currentPage * itemsPerPage, sortedEmployees.length)}
            </span>{" "}
            dari <span className="font-semibold text-white">{sortedEmployees.length}</span>{" "}
            Karyawan
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
