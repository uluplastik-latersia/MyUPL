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
  Briefcase,
  DollarSign,
  FileText,
  AlertOctagon,
  Settings,
  Gem,
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
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-200/80 bg-white flex flex-col justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header & Branding (Styled like "Req" Logo in reference images) */}
      <div>
        <div className="h-18 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            {/* Geometric Blue Bars Icon matching "Req" */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-2.5 h-7 bg-blue-600 rounded-full" />
              <div className="w-2.5 h-5 bg-blue-500 rounded-full mt-2" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Req</span>
                <span className="text-xs font-bold uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md border border-blue-200">
                  UPL
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)]">
          {/* Group 1: Main Menu */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 tracking-wide">
                Main Menu
              </div>
            )}

            {/* Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === "dashboard" ? "text-white" : "text-slate-400"}`} />
              {!collapsed && <span>Dashboard</span>}
            </button>

            {/* Employee */}
            <button
              onClick={() => setActiveTab("directory")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "directory"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Employee"
            >
              <Users className={`w-4 h-4 shrink-0 ${activeTab === "directory" ? "text-white" : "text-slate-400"}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Employee</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {headcount}
                  </span>
                </div>
              )}
            </button>

            {/* Mock Nav items matching the reference photo */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              title="Payroll"
            >
              <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Payroll</span>}
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              title="Leaves"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Leaves</span>}
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              title="Report"
            >
              <AlertOctagon className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Report</span>}
            </button>
          </div>

          {/* Group 2: Recruitment & OCR */}
          <div className="space-y-1 pt-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 tracking-wide">
                Recruitment
              </div>
            )}

            {/* Jobs */}
            <button
              onClick={() => setActiveTab("directory")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Jobs"
            >
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Jobs</span>
                  {expiringCount > 0 && (
                    <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-orange-500 text-white rounded-full">
                      {expiringCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Candidates / Smart OCR Scanner */}
            <button
              onClick={() => setActiveTab("scanner")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "scanner"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Candidates & OCR Scanner"
            >
              <Camera className={`w-4 h-4 shrink-0 ${activeTab === "scanner" ? "text-white" : "text-blue-600"}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>OCR Candidates</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">
                    AI
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Group 3: Settings */}
          <div className="space-y-1 pt-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 tracking-wide">
                Setting & Logout
              </div>
            )}

            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Seed Data"
            >
              <Database className="w-4 h-4 text-indigo-500 shrink-0" />
              {!collapsed && <span>{isSeeding ? "Seeding..." : "Isi Data Sample"}</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Upgrade to Premium Blue Card matching Reference Image */}
      <div className="p-3.5">
        {!collapsed ? (
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white rounded-2xl p-4 shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
              <Gem className="w-4 h-4 text-amber-300" />
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight">
              Upgrade to Premium
            </h4>
            <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
              To improve the performance of the recruitment process and unlock superior features.
            </p>

            <button
              onClick={onOpenScanner}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold transition shadow-sm"
            >
              UPGRADE TO PREMIUM
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={onOpenScanner}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white cursor-pointer shadow-md shadow-blue-500/25"
              title="Upgrade to Premium"
            >
              <Gem className="w-5 h-5 text-amber-300" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
