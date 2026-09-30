import React, { useState, useMemo } from "react";
import { AlertCircle, Clock, Calendar, ArrowRight, User, Search, CheckCircle2 } from "lucide-react";
import type { ExpiringContractAlert } from "../../types";
import { formatDateIndo } from "../../lib/utils";

interface ContractAlertsProps {
  expiring30Days: ExpiringContractAlert[];
  expiring60Days: ExpiringContractAlert[];
  onSelectEmployee: (id: string) => void;
}

export const ContractAlerts: React.FC<ContractAlertsProps> = ({
  expiring30Days,
  expiring60Days,
  onSelectEmployee,
}) => {
  const [filterType, setFilterType] = useState<"all" | "critical" | "warning">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allAlerts = useMemo(() => {
    return [...expiring30Days, ...expiring60Days];
  }, [expiring30Days, expiring60Days]);

  const displayedAlerts = useMemo(() => {
    let list = allAlerts;
    if (filterType === "critical") list = expiring30Days;
    if (filterType === "warning") list = expiring60Days;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q) ||
          (a.departmentName && a.departmentName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allAlerts, expiring30Days, expiring60Days, filterType, searchQuery]);

  if (allAlerts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Status Kontrak PKWT Aman</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tidak ada masa kerja kontrak karyawan yang akan berakhir dalam 60 hari ke depan.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Semua Kontrak Terkendali
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Peringatan Kontrak PKWT Karyawan
              </h3>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {allAlerts.length} Karyawan
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluasi perpanjangan kontrak, pengangkatan PKWTT, atau penyelesaian hak kerja
            </p>
          </div>
        </div>

        {/* Filter Tabs matching Candidate pills from Image 1 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mini Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari karyawan..."
              className="bg-slate-50 border border-slate-200 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filterType === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({allAlerts.length})
            </button>
            <button
              onClick={() => setFilterType("critical")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                filterType === "critical"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              &lt;30 Hari ({expiring30Days.length})
            </button>
            <button
              onClick={() => setFilterType("warning")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                filterType === "warning"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              30-60 Hari ({expiring60Days.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {displayedAlerts.map((emp) => {
          const isCritical = emp.daysLeft <= 30;
          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                isCritical
                  ? "bg-rose-50/50 border-rose-200 hover:border-rose-300"
                  : "bg-orange-50/50 border-orange-200 hover:border-orange-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {emp.fullName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isCritical
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {emp.daysLeft === 0 ? "Hari ini!" : `${emp.daysLeft} hari`}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium">
                  {emp.position}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {emp.departmentName || "Departemen General"}
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDateIndo(emp.endContractDate)}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-semibold text-[11px] hover:translate-x-0.5 transition-transform">
                  <span>Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
