import React from "react";
import { Users, UserPlus, TrendingDown, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { AnalyticsData } from "../../types";

interface MetricCardsProps {
  metrics: AnalyticsData["metrics"];
  onExpiringClick?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, onExpiringClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Active Headcount */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Karyawan Aktif
          </span>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            {metrics.activeHeadcount}
          </span>
          <span className="text-xs text-slate-400 font-medium">Jiwa</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span className="font-medium">Live Database Synced</span>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. New Hires (Current Year) */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rekrutmen Baru (Tahun Ini)
          </span>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            +{metrics.newHiresCurrentYear}
          </span>
          <span className="text-xs text-slate-400 font-medium">Karyawan</span>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Tergabung dalam periode {new Date().getFullYear()}
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. Turnover Rate */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Turnover Rate
          </span>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            {metrics.turnoverRate}
          </span>
          <span className="text-xs text-slate-400 font-medium">Rasio</span>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Tingkat stabilitas retensi SDM
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4. Expiring Contracts */}
      <div
        onClick={onExpiringClick}
        className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 border-amber-500/30 bg-amber-500/[0.03]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Kontrak PKWT Segera Berakhir
          </span>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-amber-300 tracking-tight">
            {metrics.totalExpiring}
          </span>
          <span className="text-xs text-slate-400">Total Karyawan</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
            <Clock className="w-3 h-3" /> &lt;30 Hari: {metrics.expiringUnder30Count}
          </span>
          <span className="text-slate-500">•</span>
          <span className="font-semibold text-amber-400">
            30-60 Hari: {metrics.expiringUnder60Count}
          </span>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
};
