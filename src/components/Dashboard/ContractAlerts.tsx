import React, { useState, useMemo } from "react";
import { AlertCircle, Clock, Calendar, ArrowRight, User, Search, Filter, CheckCircle2 } from "lucide-react";
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
      <div className="glass-panel rounded-2xl p-6 border-emerald-500/20 bg-emerald-500/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Status Kepatuhan Kontrak PKWT Aman</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Tidak ada masa kerja kontrak karyawan yang akan berakhir dalam 60 hari ke depan. Semua status hubungan kerja terkendali.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span>0 Notifikasi Aktif</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border-slate-800 space-y-4">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Pusat Peringatan Kontrak PKWT
              </h3>
              <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {allAlerts.length} Karyawan
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluasi perpanjangan kontrak, kenaikan menjadi PKWTT, atau penyelesaian hak kerja
            </p>
          </div>
        </div>

        {/* Filter Controls (Tabs + Mini Search) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan..."
              className="bg-slate-950/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 lg:w-52"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                filterType === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua ({allAlerts.length})
            </button>
            <button
              onClick={() => setFilterType("critical")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                filterType === "critical"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-rose-400 hover:text-rose-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              &lt;30 Hari ({expiring30Days.length})
            </button>
            <button
              onClick={() => setFilterType("warning")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                filterType === "warning"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              30-60 Hari ({expiring60Days.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Alert Cards - Desktop Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {displayedAlerts.map((emp) => {
          const isCritical = emp.daysLeft <= 30;
          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-lg ${
                isCritical
                  ? "bg-rose-500/[0.04] border-rose-500/25 hover:border-rose-500/60 hover:bg-rose-500/[0.08]"
                  : "bg-amber-500/[0.04] border-amber-500/25 hover:border-amber-500/60 hover:bg-amber-500/[0.08]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition truncate">
                    {emp.fullName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                      isCritical
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {emp.daysLeft === 0 ? "Hari ini!" : `${emp.daysLeft} hari`}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {emp.position}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {emp.departmentName || "Departemen General"}
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{formatDateIndo(emp.endContractDate)}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform text-[11px]">
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
