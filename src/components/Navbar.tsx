import React from "react";
import { LayoutDashboard, Users, Camera, RefreshCw, Database, Sparkles, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "directory" | "scanner";
  setActiveTab: (tab: "dashboard" | "directory" | "scanner") => void;
  onRefresh: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  expiringCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  onSeedData,
  isSeeding,
  expiringCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <span className="font-extrabold text-white text-lg tracking-wider">UPL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white tracking-tight">MyUPL</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                  HR Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Employee Management & Smart OCR Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "directory"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Karyawan</span>
            </button>

            <button
              onClick={() => setActiveTab("scanner")}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "scanner"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300">OCR Scanner</span>
              <span className="hidden md:inline-block text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                AI Flash
              </span>
            </button>
          </nav>

          {/* Quick Actions & System Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {expiringCount > 0 && (
              <div
                title={`${expiringCount} kontrak akan habis dalam 60 hari`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium cursor-pointer"
                onClick={() => setActiveTab("dashboard")}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{expiringCount} Kontrak PKWT</span>
              </div>
            )}

            <button
              onClick={onSeedData}
              disabled={isSeeding}
              title="Populate initial sample departments & employee records"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSeeding ? "Seeding..." : "Seed Data"}</span>
            </button>

            <button
              onClick={onRefresh}
              title="Sync & refresh live data"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
