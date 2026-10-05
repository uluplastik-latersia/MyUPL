import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  FileSpreadsheet,
  Download,
  UploadCloud,
  AlertCircle,
  Filter,
  RotateCcw,
  X,
  ChevronDown,
  User,
  Building2,
  Briefcase,
  MapPin,
  Check,
} from "lucide-react";
import type { Employee, Department, EmploymentStatus } from "../../types";
import {
  formatDateIndo,
  calculateTenure,
  exportEmployeesToCsv,
  downloadEmployeeCsvTemplate,
} from "../../lib/utils";
import { CsvImportModal } from "./CsvImportModal";

interface EmployeeDirectoryProps {
  employees: Employee[];
  departments: Department[];
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string, name: string) => void;
  onAddNew: () => void;
  onRefreshData?: () => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  departments,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddNew,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Specific Column Filters (as requested: jenis kelamin, domisili, departemen, jabatan)
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [domicileFilter, setDomicileFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");

  // Header Dropdown Popover State
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<
    "gender" | "domicile" | "department" | "position" | null
  >(null);

  // CSV Import Modal state
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);

  // Close header dropdown when clicking outside
  const headerDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerDropdownRef.current &&
        !headerDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Unique Values for Filter Dropdowns
  const uniqueDomiciles = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      const city =
        emp.birthPlace || (emp.address ? emp.address.split(",")[0].trim() : "");
      if (city) set.add(city.toUpperCase());
    });
    return Array.from(set).sort();
  }, [employees]);

  const uniqueDepartments = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.id, d.name));
    employees.forEach((e) => {
      if (e.departmentId && e.departmentName) {
        map.set(e.departmentId, e.departmentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [departments, employees]);

  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.position?.trim()) set.add(emp.position.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [employees]);

  // Check if any column filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      genderFilter !== "ALL" ||
      domicileFilter !== "ALL" ||
      departmentFilter !== "ALL" ||
      positionFilter !== "ALL" ||
      searchTerm !== "" ||
      activeTabFilter !== "ALL"
    );
  }, [
    genderFilter,
    domicileFilter,
    departmentFilter,
    positionFilter,
    searchTerm,
    activeTabFilter,
  ]);

  const handleResetFilters = () => {
    setGenderFilter("ALL");
    setDomicileFilter("ALL");
    setDepartmentFilter("ALL");
    setPositionFilter("ALL");
    setSearchTerm("");
    setActiveTabFilter("ALL");
    setCurrentPage(1);
    setActiveHeaderDropdown(null);
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

      // Gender filter
      if (genderFilter !== "ALL" && emp.gender !== genderFilter) {
        return false;
      }

      // Department filter
      if (
        departmentFilter !== "ALL" &&
        emp.departmentId !== departmentFilter &&
        emp.departmentName?.toUpperCase() !== departmentFilter.toUpperCase()
      ) {
        return false;
      }

      // Position filter
      if (
        positionFilter !== "ALL" &&
        emp.position?.toUpperCase() !== positionFilter.toUpperCase()
      ) {
        return false;
      }

      // Domicile filter
      if (domicileFilter !== "ALL") {
        const empCity =
          emp.birthPlace || (emp.address ? emp.address.split(",")[0].trim() : "");
        if (empCity.toUpperCase() !== domicileFilter.toUpperCase()) {
          return false;
        }
      }

      // Search term
      const s = searchTerm.toLowerCase().trim();
      if (!s) return true;
      return (
        emp.fullName.toLowerCase().includes(s) ||
        emp.nik.includes(s) ||
        (emp.position && emp.position.toLowerCase().includes(s)) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(s)) ||
        (emp.birthPlace && emp.birthPlace.toLowerCase().includes(s)) ||
        (emp.address && emp.address.toLowerCase().includes(s))
      );
    });
  }, [
    employees,
    activeTabFilter,
    genderFilter,
    departmentFilter,
    positionFilter,
    domicileFilter,
    searchTerm,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Status Pill Helper
  const renderStatusPill = (status: EmploymentStatus | string) => {
    if (status === "PKWTT" || status === "TETAP") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          PKWTT (Tetap)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        PKWT (Kontrak)
      </span>
    );
  };

  // Gender Badge Helper
  const renderGenderBadge = (gender: string) => {
    if (gender === "PEREMPUAN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          Perempuan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        Laki-laki
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Candidates & Karyawan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total Candidates{" "}
            <strong className="text-slate-700 font-semibold">
              {employees.length}
            </strong>
            {filteredEmployees.length !== employees.length && (
              <span className="ml-1 text-blue-600 font-medium">
                ({filteredEmployees.length} terfilter)
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons: Template CSV, Import CSV, Export CSV, Tambah Karyawan */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => downloadEmployeeCsvTemplate()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
            title="Download Template CSV Resmi Form Pendaftaran Karyawan"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Template CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
            title="Upload data karyawan dari file CSV"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportEmployeesToCsv(filteredEmployees)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
            title="Export data saat ini ke CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Main Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Pills: All Candidates, PKWT, PKWTT */}
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

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100/70 transition ml-1"
              title="Reset semua filter aktif"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Right Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, NIK, domisili..."
              className="bg-white border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        ref={headerDropdownRef}
        className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/50">
                {/* Select All Checkbox */}
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredEmployees.length > 0 &&
                      selectedIds.length === filteredEmployees.length
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>

                {/* Candidate / Name */}
                <th className="py-4 px-4 font-bold text-slate-800 min-w-[200px]">
                  Karyawan / Nama
                </th>

                {/* Jenis Kelamin with Column Filter */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[130px] relative">
                  <div className="flex items-center gap-1.5">
                    <span>Jenis Kelamin</span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHeaderDropdown(
                          activeHeaderDropdown === "gender" ? null : "gender"
                        )
                      }
                      className={`p-1 rounded-md transition ${
                        genderFilter !== "ALL"
                          ? "bg-blue-100 text-blue-600 font-bold"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                      }`}
                      title="Filter Jenis Kelamin"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Dropdown Menu for Gender */}
                  {activeHeaderDropdown === "gender" && (
                    <div className="absolute top-12 left-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-44 animate-in fade-in zoom-in-95 font-normal">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Filter Gender
                      </div>
                      <button
                        onClick={() => {
                          setGenderFilter("ALL");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          genderFilter === "ALL"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>Semua Gender</span>
                        {genderFilter === "ALL" && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setGenderFilter("LAKI-LAKI");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          genderFilter === "LAKI-LAKI"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>LAKI-LAKI</span>
                        {genderFilter === "LAKI-LAKI" && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setGenderFilter("PEREMPUAN");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          genderFilter === "PEREMPUAN"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>PEREMPUAN</span>
                        {genderFilter === "PEREMPUAN" && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </th>

                {/* Domisili with Column Filter */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[140px] relative">
                  <div className="flex items-center gap-1.5">
                    <span>Domisili</span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHeaderDropdown(
                          activeHeaderDropdown === "domicile" ? null : "domicile"
                        )
                      }
                      className={`p-1 rounded-md transition ${
                        domicileFilter !== "ALL"
                          ? "bg-blue-100 text-blue-600 font-bold"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                      }`}
                      title="Filter Domisili"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Dropdown Menu for Domicile */}
                  {activeHeaderDropdown === "domicile" && (
                    <div className="absolute top-12 left-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-52 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 font-normal">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Filter Domisili
                      </div>
                      <button
                        onClick={() => {
                          setDomicileFilter("ALL");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          domicileFilter === "ALL"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>Semua Domisili</span>
                        {domicileFilter === "ALL" && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {uniqueDomiciles.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setDomicileFilter(city);
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                            domicileFilter === city
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {domicileFilter === city && (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Departemen with Column Filter */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[150px] relative">
                  <div className="flex items-center gap-1.5">
                    <span>Departemen</span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHeaderDropdown(
                          activeHeaderDropdown === "department" ? null : "department"
                        )
                      }
                      className={`p-1 rounded-md transition ${
                        departmentFilter !== "ALL"
                          ? "bg-blue-100 text-blue-600 font-bold"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                      }`}
                      title="Filter Departemen"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Dropdown Menu for Department */}
                  {activeHeaderDropdown === "department" && (
                    <div className="absolute top-12 left-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-56 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 font-normal">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Filter Departemen
                      </div>
                      <button
                        onClick={() => {
                          setDepartmentFilter("ALL");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          departmentFilter === "ALL"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>Semua Departemen</span>
                        {departmentFilter === "ALL" && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {uniqueDepartments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => {
                            setDepartmentFilter(dept.id);
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                            departmentFilter === dept.id
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          {departmentFilter === dept.id && (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Jabatan with Column Filter */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[160px] relative">
                  <div className="flex items-center gap-1.5">
                    <span>Jabatan</span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHeaderDropdown(
                          activeHeaderDropdown === "position" ? null : "position"
                        )
                      }
                      className={`p-1 rounded-md transition ${
                        positionFilter !== "ALL"
                          ? "bg-blue-100 text-blue-600 font-bold"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                      }`}
                      title="Filter Jabatan"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Dropdown Menu for Position */}
                  {activeHeaderDropdown === "position" && (
                    <div className="absolute top-12 left-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-60 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 font-normal">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Filter Jabatan
                      </div>
                      <button
                        onClick={() => {
                          setPositionFilter("ALL");
                          setActiveHeaderDropdown(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                          positionFilter === "ALL"
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>Semua Jabatan</span>
                        {positionFilter === "ALL" && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {uniquePositions.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => {
                            setPositionFilter(pos);
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl text-left transition ${
                            positionFilter === pos
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{pos}</span>
                          {positionFilter === pos && (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Status Hubungan Kerja */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[120px]">
                  Status
                </th>

                {/* Masa Kerja */}
                <th className="py-4 px-3 font-semibold text-slate-700 min-w-[110px]">
                  Masa Kerja
                </th>

                {/* Action */}
                <th className="py-4 px-4 text-center font-semibold text-slate-700 w-24">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada data kandidat atau karyawan yang cocok.</span>
                    {hasActiveFilters && (
                      <div className="mt-3">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                        >
                          Reset Semua Filter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  const displayCity =
                    emp.birthPlace ||
                    (emp.address ? emp.address.split(",")[0].trim() : "-");

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onViewEmployee(emp)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => toggleSelectOne(emp.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Candidate Avatar, Full Name, NIK */}
                      <td className="py-3 px-4">
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
                            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              NIK: {emp.nik}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Jenis Kelamin */}
                      <td className="py-3 px-3">
                        {renderGenderBadge(emp.gender)}
                      </td>

                      {/* Domisili */}
                      <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-[150px]">
                        <span title={emp.address || emp.birthPlace || ""}>
                          {displayCity}
                        </span>
                      </td>

                      {/* Departemen */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                          {emp.departmentName || "PRODUKSI"}
                        </span>
                      </td>

                      {/* Jabatan */}
                      <td className="py-3 px-3 text-slate-700 font-semibold text-xs">
                        {emp.position || "General Staff"}
                      </td>

                      {/* Status Hubungan Kerja */}
                      <td className="py-3 px-3">
                        {renderStatusPill(emp.employmentStatus)}
                      </td>

                      {/* Masa Kerja */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 text-xs">
                          {calculateTenure(emp.joinDate)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Masuk: {emp.joinDate ? emp.joinDate.replace(/-/g, "/") : "-"}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition"
                            title="Edit Data Karyawan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEmployee(emp.id, emp.fullName)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition"
                            title="Hapus Data Karyawan"
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

        {/* Pagination Section */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredEmployees.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
            </strong>{" "}
            out of{" "}
            <strong className="text-slate-800">{filteredEmployees.length}</strong>{" "}
            entries
          </div>

          <div className="flex items-center gap-4">
            {/* Number buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => i + 1
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
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

              {totalPages > 5 && (
                <span className="px-1 text-slate-400">...</span>
              )}

              <button
                type="button"
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

      {/* Csv Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportModalOpen}
        onClose={() => setIsCsvImportModalOpen(false)}
        departments={departments}
        onImportSuccess={(count) => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
};
