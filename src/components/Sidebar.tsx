import React from "react";
import {
  LayoutDashboard,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,
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
  onSeedData?: () => void;
  isSeeding?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  headcount,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-200/80 bg-white flex flex-col justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header & Branding (MyUPL logo) */}
      <div>
        <div className="h-18 border-b border-slate-100 flex items-center">
          {collapsed ? (
            <div className="w-full flex items-center justify-between px-2.5 py-4">
              <div
                className="cursor-pointer hover:opacity-85 transition shrink-0 flex items-center justify-center"
                onClick={() => setActiveTab("dashboard")}
                title="MyUPL Dashboard"
              >
                <img
                  src="/logo.png"
                  alt="MyUPL Logo"
                  className="w-7 h-7 object-contain shrink-0"
                />
              </div>
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition shrink-0"
                title="Perluas Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between px-5 py-4">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition shrink-0"
                onClick={() => setActiveTab("dashboard")}
                title="MyUPL Dashboard"
              >
                <img
                  src="/logo.png"
                  alt="MyUPL Logo"
                  className="h-8 w-auto max-w-[32px] object-contain shrink-0"
                />
                <span className="font-extrabold text-2xl text-black tracking-tight whitespace-nowrap">
                  MyUPL
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition shrink-0"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation - Only active features */}
        <nav className="p-3.5 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Main Menu
            </div>
          )}

          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                activeTab === "dashboard" ? "text-white" : "text-slate-400"
              }`}
            />
            {!collapsed && <span>Dashboard</span>}
          </button>

          {/* 2. Employee Directory */}
          <button
            onClick={() => setActiveTab("directory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "directory"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Employee"
          >
            <Users
              className={`w-4 h-4 shrink-0 ${
                activeTab === "directory" ? "text-white" : "text-slate-400"
              }`}
            />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Employee</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "directory"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {headcount}
                </span>
              </div>
            )}
          </button>

          {/* 3. OCR Candidates & Scanner */}
          <button
            onClick={() => setActiveTab("scanner")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "scanner"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="OCR Candidates"
          >
            <Camera
              className={`w-4 h-4 shrink-0 ${
                activeTab === "scanner" ? "text-white" : "text-blue-600"
              }`}
            />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>OCR Candidates</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    activeTab === "scanner"
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
                >
                  AI
                </span>
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Status / System Info */}
      <div className="p-3.5 border-t border-slate-100">
        {!collapsed ? (
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              libSQL Turso Edge
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.0</span>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Turso libSQL Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          </div>
        )}
      </div>
    </aside>
  );
};
