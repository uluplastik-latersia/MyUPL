import React from "react";
import { AlertCircle, Clock, Calendar, ArrowRight, User } from "lucide-react";
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
  const allAlerts = [...expiring30Days, ...expiring60Days];

  if (allAlerts.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-5 border-emerald-500/20 bg-emerald-500/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Status Kontrak PKWT Aman</h4>
            <p className="text-xs text-slate-400">
              Tidak ada masa kerja kontrak karyawan yang akan berakhir dalam 60 hari ke depan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5 border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Peringatan Kontrak PKWT Karyawan
            </h3>
            <p className="text-xs text-slate-400">
              Perlu evaluasi perpanjangan atau penyelesaian hak kerja ({allAlerts.length} Karyawan)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Kritis (&lt;30 hr)
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Waspada (30-60 hr)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allAlerts.map((emp) => {
          const isCritical = emp.daysLeft <= 30;
          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isCritical
                  ? "bg-rose-500/[0.05] border-rose-500/30 hover:border-rose-500/60"
                  : "bg-amber-500/[0.05] border-amber-500/30 hover:border-amber-500/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm text-white truncate">
                    {emp.fullName}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isCritical
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {emp.daysLeft === 0 ? "Hari ini!" : `${emp.daysLeft} hari lagi`}
                  </span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {emp.position} • {emp.departmentName || "General"}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Selesai: {formatDateIndo(emp.endContractDate)}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-medium hover:text-indigo-300">
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
