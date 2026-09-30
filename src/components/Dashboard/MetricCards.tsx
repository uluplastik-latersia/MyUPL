import React from "react";
import {
  Users,
  UserPlus,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import type { AnalyticsData } from "../../types";

interface MetricCardsProps {
  metrics: AnalyticsData["metrics"];
  onExpiringClick?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, onExpiringClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
      {/* 1. Total Active Headcount */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 xl:p-6 relative overflow-hidden transition-all duration-300 border-indigo-500/20 group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Karyawan Aktif
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">
            {metrics.activeHeadcount}
          </span>
          <span className="text-xs text-slate-400 font-medium">Jiwa Terdaftar</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% Data Tersinkron</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">Turso Edge</span>
        </div>

        <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
      </div>

      {/* 2. New Hires (Current Year) */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 xl:p-6 relative overflow-hidden transition-all duration-300 border-emerald-500/20 group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Karyawan Baru ({new Date().getFullYear()})
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-emerald-400 tracking-tight">
            +{metrics.newHiresCurrentYear}
          </span>
          <span className="text-xs text-slate-400 font-medium">Rekrutmen Baru</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Ekspansi Tenaga Kerja</span>
          <span className="text-emerald-400 font-medium text-[11px]">Tahun Ini</span>
        </div>

        <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      </div>

      {/* 3. Turnover Rate */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 xl:p-6 relative overflow-hidden transition-all duration-300 border-cyan-500/20 group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Turnover Rate
          </span>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">
            {metrics.turnoverRate}
          </span>
          <span className="text-xs text-slate-400 font-medium">Indeks Retensi</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Kategori Retensi:</span>
          <span className="text-cyan-400 font-semibold text-[11px]">Sangat Sehat (&lt;5%)</span>
        </div>

        <div className="absolute right-0 bottom-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
      </div>

      {/* 4. Expiring Contracts */}
      <div
        onClick={onExpiringClick}
        className="glass-panel glass-panel-hover rounded-2xl p-5 xl:p-6 relative overflow-hidden cursor-pointer transition-all duration-300 border-amber-500/30 bg-amber-500/[0.03] group hover:border-amber-500/60"
        title="Klik untuk melompat ke rincian kontrak"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Kontrak PKWT Segera Berakhir
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-amber-300 tracking-tight">
            {metrics.totalExpiring}
          </span>
          <span className="text-xs text-slate-400 font-medium">Perlu Tindakan HR</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-rose-400 text-[11px]">
            <Clock className="w-3 h-3" /> &lt;30 Hr: {metrics.expiringUnder30Count}
          </span>
          <span className="font-bold text-amber-400 text-[11px]">
            30-60 Hr: {metrics.expiringUnder60Count}
          </span>
        </div>

        <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-colors" />
      </div>
    </div>
  );
};
