import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Camera,
  FileSpreadsheet,
  Clock,
  Bell,
  Command,
  ChevronRight,
  Shield,
  User,
} from "lucide-react";

interface DesktopHeaderProps {
  activeTab: "dashboard" | "directory" | "scanner";
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  onRefresh: () => void;
  onAddNew: () => void;
  onOpenScanner: () => void;
  onExportCsv: () => void;
  expiringCount: number;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  onAddNew,
  onOpenScanner,
  onExportCsv,
  expiringCount,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setCurrentTime(now.toLocaleDateString("id-ID", options) + " WIB");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          section: "HR Analytics",
          title: "Executive Intelligence & Demographics",
          subtitle: "Analitik komprehensif, retensi karyawan, dan visualisasi tenaga kerja",
        };
      case "directory":
        return {
          section: "Kepegawaian",
          title: "Master Data & Direktori Karyawan",
          subtitle: "Daftar seluruh data karyawan aktif, riwayat PKWT, dan ekspor data",
        };
      case "scanner":
        return {
          section: "Onboarding",
          title: "Smart e-KTP & KK Scanner AI",
          subtitle: "Ekstraksi data kependudukan instan menggunakan Google Gemini 3.8 Flash",
        };
    }
  };

  const breadcrumb = getBreadcrumbTitle();

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-semibold text-indigo-400">MyUPL</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-medium">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
            {breadcrumb.title}
          </h1>
        </div>
      </div>

      {/* Middle: Universal Search Bar (Ctrl+K) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Cari cepat NIK, Nama, Divisi, atau Jabatan..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-14 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded shadow">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions, Live Clock & Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Digital Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tracking-tight">{currentTime}</span>
        </div>

        {/* Refresh Sync */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
          title="Sinkronisasi Data Live"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Export CSV Shortcut */}
        <button
          onClick={onExportCsv}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          title="Unduh seluruh data ke CSV / Excel"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Excel</span>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-600/20 border border-indigo-400/30">
            HR
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">Admin HRD</div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PT Ulu Plastik
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
