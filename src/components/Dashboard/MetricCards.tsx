import React from "react";
import {
  Users,
  UserPlus,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowUpRight,
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

      {/* 2. New Hires (Current Year) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rekrutmen ({new Date().getFullYear()})
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl xl:text-4xl font-extrabold text-emerald-600 tracking-tight">
            +{metrics.newHiresCurrentYear}
          </span>
          <span className="text-xs text-slate-400 font-medium">Karyawan Baru</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Tahun Berjalan</span>
          <span className="text-emerald-600 font-semibold">Aktif</span>
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
  );
};
