import React, { useState } from "react";
import {
  Users,
  Cake,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Gift,
  X,
  User,
} from "lucide-react";
import type { AnalyticsData, BirthdayEmployee } from "../../types";

interface MetricCardsProps {
  metrics: AnalyticsData["metrics"];
  todayBirthdays?: BirthdayEmployee[];
  onExpiringClick?: () => void;
  onSelectEmployee?: (id: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  todayBirthdays = [],
  onExpiringClick,
  onSelectEmployee,
}) => {
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const count = todayBirthdays.length || metrics.birthdayTodayCount || 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
        {/* 1. Total Active Headcount */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Karyawan Aktif
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
              {metrics.activeHeadcount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Jiwa</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Database Synced
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Turso Edge</span>
          </div>
        </div>

        {/* 2. Birthday Today Card */}
        <div
          onClick={() => {
            if (count > 0) setIsBirthdayModalOpen(true);
          }}
          className={`bg-white rounded-3xl p-6 border transition-all ${
            count > 0
              ? "border-pink-200 shadow-[0_2px_12px_rgba(244,63,94,0.06)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.14)] cursor-pointer group"
              : "border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>Ulang Tahun Hari Ini</span>
              {count > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              )}
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform ${
                count > 0
                  ? "bg-pink-50 text-pink-600 group-hover:scale-110"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              <Cake className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`text-3xl xl:text-4xl font-extrabold tracking-tight ${
                count > 0 ? "text-pink-600" : "text-slate-400"
              }`}
            >
              {count}
            </span>
            <span className="text-xs text-slate-400 font-medium">Karyawan</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {count > 0 ? (
              <>
                <span className="text-pink-600 font-semibold truncate max-w-[170px] flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {todayBirthdays[0]?.fullName || "Lihat detail"}
                    {count > 1 ? ` & +${count - 1} lainnya` : ""}
                  </span>
                </span>
                <span className="text-pink-500 font-semibold hover:underline shrink-0">
                  Lihat →
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400">Tidak ada hari ini</span>
                <span className="text-slate-400 font-medium">Semua aktif</span>
              </>
            )}
          </div>
        </div>

      {/* 3. Turnover Rate */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.08)] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Turnover Rate
          </span>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
            {metrics.turnoverRate}
          </span>
          <span className="text-xs text-slate-400 font-medium">Rasio Retensi</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Stabilitas SDM</span>
          <span className="text-cyan-600 font-semibold">&lt;5% (Sehat)</span>
        </div>
      </div>

      {/* 4. Expiring Contracts */}
      <div
        onClick={onExpiringClick}
        className="bg-white rounded-3xl p-6 border border-orange-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.1)] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            Kontrak PKWT Segera Habis
          </span>
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-orange-600 tracking-tight">
            {metrics.totalExpiring}
          </span>
          <span className="text-xs text-slate-400 font-medium">Karyawan</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-rose-600 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> &lt;30 Hr: {metrics.expiringUnder30Count}
          </span>
          <span className="text-orange-600 font-medium">
            30-60 Hr: {metrics.expiringUnder60Count}
          </span>
        </div>
      </div>
    </div>

      {/* Birthday Modal */}
      {isBirthdayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-pink-100 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                  <Cake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Karyawan Ulang Tahun Hari Ini 🎉
                  </h3>
                  <p className="text-xs text-pink-100 font-medium">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBirthdayModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-3">
              {todayBirthdays.length > 0 ? (
                todayBirthdays.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setIsBirthdayModalOpen(false);
                      onSelectEmployee?.(emp.id);
                    }}
                    className="p-4 rounded-2xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/80 flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-pink-600 transition-colors">
                          {emp.fullName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {emp.position} • {emp.departmentName || "General"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                        🎂 {emp.age} Tahun
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {emp.birthDate}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Cake className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm">Tidak ada karyawan yang berulang tahun hari ini.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Klik karyawan untuk melihat data profil lengkap.</span>
              <button
                onClick={() => setIsBirthdayModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
