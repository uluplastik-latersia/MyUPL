import React from "react";
import {
  LayoutDashboard,
  Users,
  Camera,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Cpu,
  Clock,
  ExternalLink,
  Plus,
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "directory" | "scanner";
  setActiveTab: (tab: "dashboard" | "directory" | "scanner") => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  headcount: number;
  expiringCount: number;
  onAddNew: () => void;
  onOpenScanner: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  headcount,
  expiringCount,
  onAddNew,
  onOpenScanner,
  onSeedData,
  isSeeding,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col justify-between select-none ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header & Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
              <span className="font-extrabold text-white text-base tracking-wider">UPL</span>
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base tracking-tight">MyUPL</span>
                  <span className="text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">HR & Employee Analytics</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Desktop Action Buttons */}
        <div className="p-3 space-y-2 border-b border-slate-800/80">
          <button
            onClick={onOpenScanner}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/25 ${
              collapsed ? "px-0" : ""
            }`}
            title="Buka Kamera / Unggah KTP"
          >
            <Camera className="w-4 h-4 shrink-0 text-emerald-200" />
            {!collapsed && <span>Pindai e-KTP OCR</span>}
          </button>

          <button
            onClick={onAddNew}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition ${
              collapsed ? "px-0" : ""
            }`}
            title="Tambah Karyawan Manual"
          >
            <Plus className="w-4 h-4 shrink-0 text-indigo-400" />
            {!collapsed && <span>Input Karyawan Baru</span>}
          </button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${collapsed ? "text-center" : ""}`}>
            {collapsed ? "•••" : "Menu Utama"}
          </div>

          {/* 1. Dashboard Tab */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
            title="Dashboard Analitik Eksekutif"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Executive Dashboard</span>
                <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700/50">
                  Live
                </span>
              </div>
            )}
          </button>

          {/* 2. Employee Directory Tab */}
          <button
            onClick={() => setActiveTab("directory")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "directory"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
            title="Master Data & Direktori Karyawan"
          >
            <Users className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Direktori Karyawan</span>
                <span className="text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700/50">
                  {headcount}
                </span>
              </div>
            )}
          </button>

          {/* 3. Smart OCR Scanner Tab */}
          <button
            onClick={() => setActiveTab("scanner")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "scanner"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
            title="Smart OCR KTP Onboarding"
          >
            <Camera className="w-4 h-4 shrink-0 text-emerald-400" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Smart Onboarding</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Gemini Flash
                </span>
              </div>
            )}
          </button>

          {/* Expiring PKWT Alert Quick Jump */}
          {expiringCount > 0 && (
            <div
              onClick={() => setActiveTab("dashboard")}
              className={`mt-3 cursor-pointer p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition ${
                collapsed ? "text-center" : ""
              }`}
              title={`${expiringCount} Kontrak PKWT Segera Berakhir`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-amber-300">
                      {expiringCount} Kontrak PKWT
                    </div>
                    <div className="text-[10px] text-slate-400">Habis dlm &lt;60 hari</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section: System Status & Infrastructure */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Turso libSQL
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Gemini 3.8
              </span>
              <span className="text-indigo-300 font-mono text-[10px]">Edge OCR</span>
            </div>

            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] border border-slate-700 transition"
              title="Populate initial sample departments & employee records"
            >
              <Database className="w-3 h-3 text-indigo-400" />
              <span>{isSeeding ? "Seeding..." : "Isi Data Sample"}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
              title="Database Turso Live"
            />
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Isi Data Sample"
            >
              <Database className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        )}

        <div className={`text-[10px] text-slate-500 font-mono ${collapsed ? "text-center" : "px-1"}`}>
          {!collapsed ? "MyUPL Enterprise v1.2" : "v1.2"}
        </div>
      </div>
    </aside>
  );
};
