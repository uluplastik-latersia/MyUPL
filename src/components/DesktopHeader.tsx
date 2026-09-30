import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  RefreshCw,
  Plus,
  Camera,
  FileSpreadsheet,
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
  const [greeting, setGreeting] = useState("Selamat Pagi");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) setGreeting("Selamat Pagi");
    else if (hour >= 11 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
      {/* Search Input Bar matching Reference Image (Pill shape with embedded Search button) */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative flex items-center bg-[#F4F6FB] rounded-full p-1 pl-4 border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-xs font-semibold shadow-sm transition shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Right: Greeting, Notifications & Profile Avatar */}
      <div className="flex items-center gap-6">
        {/* Quick Sync */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Greeting Text */}
        <div className="hidden sm:block text-right">
          <span className="text-sm font-medium text-slate-600">
            {greeting},{" "}
            <strong className="text-slate-900 font-bold">Puput Setiadi!</strong>
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 text-slate-500 transition">
          <Bell className="w-5 h-5" />
          {expiringCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/20" />
          )}
        </div>

        {/* User Circular Avatar */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Puput Setiadi"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if unsplash fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span>PS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
