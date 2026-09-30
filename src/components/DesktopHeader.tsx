import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";
import type { ExpiringContractAlert } from "../types";

interface DesktopHeaderProps {
  activeTab: "dashboard" | "directory" | "scanner";
  onRefresh: () => void;
  expiringCount: number;
  expiring30Days?: ExpiringContractAlert[];
  expiring60Days?: ExpiringContractAlert[];
  onSelectEmployee?: (id: string) => void;
  onViewAllAlerts?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  onRefresh,
  expiringCount,
  expiring30Days = [],
  expiring60Days = [],
  onSelectEmployee,
  onViewAllAlerts,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Live real-time clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Format Indonesian Date & Time
  const dateFormatted = currentDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatted =
    currentDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB";

  // Tab Title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Executive HR Dashboard",
          subtitle: "Analitik Karyawan, Demografi & Peringatan Kontrak",
        };
      case "directory":
        return {
          title: "Direktori Data Karyawan",
          subtitle: "Kelola Master Data, Status Hubungan Kerja & Arsip",
        };
      case "scanner":
        return {
          title: "Smart OCR e-KTP Onboarding",
          subtitle: "Ekstraksi Otomatis Dokumen Berbasis Google Gemini Vision",
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
      {/* Left: Active Module / Page Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Right: Live Date & Time, Sync, and Interactive Notification Bell */}
      <div className="flex items-center gap-4">
        {/* Real-time Date & Time Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-sm text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{dateFormatted}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 font-semibold text-blue-700 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Quick Sync / Refresh Data */}
        <button
          onClick={onRefresh}
          className="p-2.5 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          title="Sinkronisasi Data Turso"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Functional Notification Button with Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2.5 rounded-xl transition border ${
              isNotificationOpen
                ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200/80"
            }`}
            title="Pusat Notifikasi & Kontrak"
          >
            <Bell className="w-4 h-4" />
            {expiringCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {expiringCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Popover */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-96 max-w-[90vw] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Pusat Notifikasi
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Peringatan masa berlaku kontrak PKWT
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notification Body List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {expiringCount === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800">
                      Semua Kontrak Aman
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Tidak ada kontrak karyawan yang berakhir dalam 60 hari ke depan.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Urgensi < 30 Hari */}
                    {expiring30Days.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          if (onSelectEmployee) onSelectEmployee(alert.id);
                          setIsNotificationOpen(false);
                        }}
                        className="p-3.5 hover:bg-rose-50/40 transition cursor-pointer flex items-start gap-3"
                      >
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {alert.fullName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                              {alert.daysLeft <= 0 ? "Hari ini" : `${alert.daysLeft} hari lagi`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {alert.position} • {alert.departmentName || "Divisi Operasional"}
                          </p>
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            Masa kontrak berakhir: {alert.endContractDate}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Urgensi 30 - 60 Hari */}
                    {expiring60Days.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          if (onSelectEmployee) onSelectEmployee(alert.id);
                          setIsNotificationOpen(false);
                        }}
                        className="p-3.5 hover:bg-amber-50/40 transition cursor-pointer flex items-start gap-3"
                      >
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0 mt-0.5">
                          <Clock3 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {alert.fullName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                              {alert.daysLeft} hari lagi
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {alert.position} • {alert.departmentName || "Divisi Operasional"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Masa kontrak berakhir: {alert.endContractDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer Action */}
              {expiringCount > 0 && onViewAllAlerts && (
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onViewAllAlerts();
                      setIsNotificationOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>Tinjau Semua di Widget Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
