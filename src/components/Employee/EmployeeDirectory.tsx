import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Copy,
  Check,
  Plus,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { Employee, Department, EmploymentStatus } from "../../types";
import { formatDateIndo, exportEmployeesToCsv } from "../../lib/utils";

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
  const [activeTabFilter, setActiveTabFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedNik, setCopiedNik] = useState<string | null>(null);

  const handleCopyNik = (nik: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nik);
    setCopiedNik(nik);
    setTimeout(() => setCopiedNik(null), 2000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter Data
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab filter
      if (activeTabFilter !== "ALL" && emp.employmentStatus !== activeTabFilter) {
        return false;
      }

      // Search
      const s = searchTerm.toLowerCase();
      if (!s) return true;
      return (
        emp.fullName.toLowerCase().includes(s) ||
        emp.nik.includes(s) ||
        (emp.position && emp.position.toLowerCase().includes(s)) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(s)) ||
        (emp.address && emp.address.toLowerCase().includes(s))
      );
    });
  }, [employees, activeTabFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Status Pill Helper matching Image 1
  const renderStatusPill = (status: EmploymentStatus | string) => {
    if (status === "PKWTT" || status === "TETAP") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          PKWTT (Tetap)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        PKWT (Kontrak)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle matching Candidates view in Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates & Karyawan</h2>
          <p className="text-xs text-slate-400 mt-1">
            Total Candidates <strong className="text-slate-700 font-semibold">{employees.length}</strong>
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportEmployeesToCsv(filteredEmployees)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Pill Bar matching Image 1 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Pills: All Candidates, Screening, Phsycology Test, Interview, Offering, Rejected */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTabFilter("ALL");
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition shadow-sm ${
              activeTabFilter === "ALL"
                ? "bg-blue-600 text-white shadow-blue-500/25"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            All Candidates ({employees.length})
          </button>

          <button
            onClick={() => {
              setActiveTabFilter("PKWT");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${
              activeTabFilter === "PKWT"
                ? "bg-blue-600 text-white font-bold shadow-blue-500/25"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            PKWT (Kontrak)
          </button>

          <button
            onClick={() => {
              setActiveTabFilter("PKWTT");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${
              activeTabFilter === "PKWTT"
                ? "bg-blue-600 text-white font-bold shadow-blue-500/25"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            PKWTT (Tetap)
          </button>
        </div>

        {/* Right Sort & Search Bar matching Image 1 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort by:</span>
            <span className="font-semibold text-slate-800">Last update</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="bg-white border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card matching Image 1 */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredEmployees.length > 0 &&
                      selectedIds.length === filteredEmployees.length
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-4 px-4 font-semibold text-slate-700">Candidates ▾</th>
                <th className="py-4 px-4 font-semibold text-slate-700">Status</th>
                <th className="py-4 px-4 font-semibold text-slate-700">Apply Date ▾</th>
                <th className="py-4 px-4 font-semibold text-slate-700">Domicile ▾</th>
                <th className="py-4 px-6 text-center font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada data kandidat atau karyawan yang cocok.</span>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onViewEmployee(emp)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-6 text-center" onClick={(e) => toggleSelectOne(emp.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Candidate Avatar & Full Name & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden shrink-0 shadow-sm">
                            {emp.ktpImageBase64OrUrl ? (
                              <img
                                src={
                                  emp.ktpImageBase64OrUrl.startsWith("data:")
                                    ? emp.ktpImageBase64OrUrl
                                    : `data:image/jpeg;base64,${emp.ktpImageBase64OrUrl}`
                                }
                                alt={emp.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{emp.fullName.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-snug">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {emp.position || "General Staff"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Pill with Solid Colored Dot */}
                      <td className="py-3.5 px-4">
                        {renderStatusPill(emp.employmentStatus)}
                      </td>

                      {/* Apply Date / Join Date formatted e.g. 1/07/2024 */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                        {emp.joinDate ? emp.joinDate.replace(/-/g, "/") : "-"}
                      </td>

                      {/* Domicile (City or Birth Place) */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {emp.birthPlace || (emp.address ? emp.address.split(",")[0] : "Jakarta")}
                      </td>

                      {/* Action Icons matching Image 1 */}
                      <td className="py-3.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEmployee(emp.id, emp.fullName)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition"
                            title="Hapus Data"
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

        {/* Pagination matching Image 1: Showing X out of Y entries, < 1 2 3 4 5 > [ 9 ▾ ] / page */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{" "}
            out of <strong className="text-slate-800">{filteredEmployees.length}</strong> entries
          </div>

          <div className="flex items-center gap-4">
            {/* Number buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value={9}>9</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
              <span>/ page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
