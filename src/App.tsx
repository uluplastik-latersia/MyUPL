import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { DesktopHeader } from "./components/DesktopHeader";
import { MetricCards } from "./components/Dashboard/MetricCards";
import { ContractAlerts } from "./components/Dashboard/ContractAlerts";
import { GlobalFilters } from "./components/Dashboard/GlobalFilters";
import { GenderChart } from "./components/Dashboard/Charts/GenderChart";
import { AgePyramidChart } from "./components/Dashboard/Charts/AgePyramidChart";
import { TenureChart } from "./components/Dashboard/Charts/TenureChart";
import { DepartmentChart } from "./components/Dashboard/Charts/DepartmentChart";
import { EmploymentStatusChart } from "./components/Dashboard/Charts/EmploymentStatusChart";
import { EmployeeDirectory } from "./components/Employee/EmployeeDirectory";
import { EmployeeDetailModal } from "./components/Employee/EmployeeDetailModal";
import { EmployeeFormModal } from "./components/Employee/EmployeeFormModal";
import { CameraScannerModal } from "./components/Scanner/CameraScannerModal";
import { OcrReviewForm } from "./components/Scanner/OcrReviewForm";
import {
  Camera,
  Users,
  ShieldCheck,
  Zap,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Database,
  AlertCircle,
  Building2,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { Employee, Department, AnalyticsData, KtpOcrResult } from "./types";
import { exportEmployeesToCsv } from "./lib/utils";

const DEFAULT_METRICS: AnalyticsData["metrics"] = {
  activeHeadcount: 0,
  newHiresCurrentYear: 0,
  turnoverRate: "0.0%",
  expiringUnder30Count: 0,
  expiringUnder60Count: 0,
  totalExpiring: 0,
};

const DEFAULT_CHARTS: AnalyticsData["charts"] = {
  genderDistribution: [
    { name: "Laki-laki", value: 0, color: "#4F46E5" },
    { name: "Perempuan", value: 0, color: "#EC4899" },
  ],
  agePyramid: [
    { bracket: "< 25 Thn", count: 0 },
    { bracket: "25 - 34 Thn", count: 0 },
    { bracket: "35 - 44 Thn", count: 0 },
    { bracket: "45 - 54 Thn", count: 0 },
    { bracket: "55+ Thn", count: 0 },
  ],
  tenureDistribution: [
    { tenure: "< 1 Tahun", count: 0 },
    { tenure: "1 - 3 Tahun", count: 0 },
    { tenure: "3 - 5 Tahun", count: 0 },
    { tenure: "> 5 Tahun", count: 0 },
  ],
  departmentBreakdown: [],
  employmentStatus: [
    { status: "TETAP", count: 0 },
    { status: "KONTRAK", count: 0 },
    { status: "HARIAN", count: 0 },
    { status: "MAGANG", count: 0 },
  ],
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "directory" | "scanner">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    metrics: DEFAULT_METRICS,
    charts: DEFAULT_CHARTS,
    alerts: { expiring30Days: [], expiring60Days: [] },
  });

  // Filter States
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  // Modals & Subflows
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Employee | null>(null);

  // OCR Onboarding Subflow
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [activeOcrData, setActiveOcrData] = useState<KtpOcrResult | null>(null);
  const [activeOcrImage, setActiveOcrImage] = useState<string | null>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Cari"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Core Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const analyticsQuery = new URLSearchParams();
      if (filterDept) analyticsQuery.append("departmentId", filterDept);
      if (filterStatus) analyticsQuery.append("status", filterStatus);

      const empQuery = new URLSearchParams();
      if (filterDept) empQuery.append("departmentId", filterDept);
      if (filterStatus) empQuery.append("status", filterStatus);

      const [deptRes, empRes, analyticsRes] = await Promise.all([
        fetch("/api/departments"),
        fetch(`/api/employees?${empQuery.toString()}`),
        fetch(`/api/analytics?${analyticsQuery.toString()}`),
      ]);

      if (deptRes.ok) {
        const d = (await deptRes.json()) as any;
        if (d.success && d.data) setDepartments(d.data);
      }

      if (empRes.ok) {
        const e = (await empRes.json()) as any;
        if (e.success && e.data) setEmployees(e.data);
      }

      if (analyticsRes.ok) {
        const a = (await analyticsRes.json()) as any;
        if (a.success && a.data) {
          setAnalytics(a.data);
        }
      }
    } catch (err: any) {
      console.warn("API offline or error fetching live edge data:", err);
    } finally {
      setLoading(false);
    }
  }, [filterDept, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Seed Initial Demo Data
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = (await res.json()) as any;
      if (data.success) {
        setSystemNotice("Database berhasil diisi dengan departemen dan data contoh karyawan!");
        await fetchData();
      } else {
        setSystemNotice(`Seed notice: ${data.error}`);
      }
    } catch (err: any) {
      setSystemNotice(`Gagal menjalankan seed: ${err.message}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSystemNotice(null), 5000);
    }
  };

  // Save / Update Employee
  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    const isEdit = Boolean(formInitialData?.id);
    const url = isEdit ? `/api/employees/${formInitialData!.id}` : "/api/employees";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });

    const data = (await response.json()) as any;
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Gagal menyimpan data karyawan.");
    }

    setSystemNotice(isEdit ? "Data karyawan berhasil diperbarui." : "Karyawan baru berhasil ditambahkan.");
    setTimeout(() => setSystemNotice(null), 4000);
    await fetchData();
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus data karyawan: ${name}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (data.success) {
        setSystemNotice(`Karyawan ${name} berhasil dihapus.`);
        await fetchData();
      } else {
        alert(data.error || "Gagal menghapus karyawan.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setSystemNotice(null), 4000);
    }
  };

  // Handle OCR Extraction Success
  const handleOcrSuccess = (ocrResult: KtpOcrResult, base64Image: string) => {
    setIsCameraModalOpen(false);
    setActiveOcrData(ocrResult);
    setActiveOcrImage(base64Image);
    setActiveTab("scanner");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-800 flex flex-row selection:bg-blue-600 selection:text-white">
      {/* Enterprise Left Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        headcount={analytics.metrics.activeHeadcount}
        expiringCount={analytics.metrics.totalExpiring}
        onAddNew={() => {
          setFormInitialData(null);
          setIsFormModalOpen(true);
        }}
        onOpenScanner={() => setIsCameraModalOpen(true)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      {/* Main Content Area (Dynamic Margin for Sidebar) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Desktop Top Header Bar */}
        <DesktopHeader
          activeTab={activeTab}
          onRefresh={fetchData}
          expiringCount={analytics.metrics.totalExpiring}
          expiring30Days={analytics.alerts.expiring30Days}
          expiring60Days={analytics.alerts.expiring60Days}
          onSelectEmployee={(id) => {
            const target = employees.find((e) => e.id === id);
            if (target) setSelectedEmployee(target);
          }}
          onViewAllAlerts={() => {
            setActiveTab("dashboard");
            setTimeout(() => {
              document.getElementById("contract-alerts-section")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />

        {/* System Notice Toast */}
        {systemNotice && (
          <div className="px-6 sm:px-8 mt-4 w-full animate-in fade-in">
            <div className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-200" />
                <span>{systemNotice}</span>
              </div>
              <button onClick={() => setSystemNotice(null)} className="underline text-[11px] opacity-80 hover:opacity-100">
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Main Desktop Dashboard Canvas */}
        <main className="flex-1 px-6 sm:px-8 py-6 w-full max-w-[1720px] mx-auto space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE HR DASHBOARD (MAXIMIZED DESKTOP LAYOUT)                 */}
          {/* ========================================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Row 1: Global Filters & Date Range Bar */}
              <GlobalFilters
                departments={departments}
                selectedDepartment={filterDept}
                setSelectedDepartment={setFilterDept}
                selectedStatus={filterStatus}
                setSelectedStatus={setFilterStatus}
                onReset={() => {
                  setFilterDept("");
                  setFilterStatus("");
                }}
              />

              {/* Row 2: 4 High-Density KPI Metric Cards */}
              <MetricCards
                metrics={analytics.metrics}
                onExpiringClick={() => {
                  const el = document.getElementById("contract-alerts-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              />

              {/* Row 3: Smart Contract Reminder Widget */}
              <div id="contract-alerts-section">
                <ContractAlerts
                  expiring30Days={analytics.alerts.expiring30Days}
                  expiring60Days={analytics.alerts.expiring60Days}
                  onSelectEmployee={(id) => {
                    const target = employees.find((e) => e.id === id);
                    if (target) setSelectedEmployee(target);
                  }}
                />
              </div>

              {/* Row 4: Visual Analytics 2x2 Desktop Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <GenderChart data={analytics.charts.genderDistribution} />
                <EmploymentStatusChart data={analytics.charts.employmentStatus} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <AgePyramidChart data={analytics.charts.agePyramid} />
                <TenureChart data={analytics.charts.tenureDistribution} />
              </div>

              {/* Row 5: Full-Width Department Headcount Breakdown */}
              <div>
                <DepartmentChart data={analytics.charts.departmentBreakdown} />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: EMPLOYEE MASTER DATA & DIRECTORY                                    */}
          {/* ========================================================================= */}
          {activeTab === "directory" && (
            <div className="space-y-6 animate-in fade-in">
              <EmployeeDirectory
                employees={employees}
                departments={departments}
                onViewEmployee={(emp) => setSelectedEmployee(emp)}
                onEditEmployee={(emp) => {
                  setFormInitialData(emp);
                  setIsFormModalOpen(true);
                }}
                onDeleteEmployee={handleDeleteEmployee}
                onAddNew={() => {
                  setFormInitialData(null);
                  setIsFormModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SMART OCR ONBOARDING (PWA CAMERA & GEMINI FLASH)                    */}
          {/* ========================================================================= */}
          {activeTab === "scanner" && (
            <div className="space-y-6 animate-in fade-in">
              {activeOcrData && activeOcrImage ? (
                <OcrReviewForm
                  ocrData={activeOcrData}
                  capturedImageBase64={activeOcrImage}
                  departments={departments}
                  onCancel={() => {
                    setActiveOcrData(null);
                    setActiveOcrImage(null);
                    setIsCameraModalOpen(true);
                  }}
                  onSubmitSuccess={async () => {
                    setActiveOcrData(null);
                    setActiveOcrImage(null);
                    setSystemNotice("Karyawan baru hasil pindai KTP berhasil diverifikasi dan disimpan ke Turso!");
                    await fetchData();
                    setActiveTab("directory");
                  }}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 xl:p-14 text-center max-w-4xl mx-auto space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mx-auto flex items-center justify-center shadow-sm">
                    <Camera className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                      Onboarding Karyawan Cepat Berbasis AI Vision
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                      Sistem terintegrasi dengan Google Gemini 3.8 Flash untuk mengekstrak data e-KTP dan Kartu Keluarga secara otomatis dengan akurasi tinggi.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                    <button
                      onClick={() => setIsCameraModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Mulai Pindai e-KTP / KK</span>
                    </button>
                  </div>

                  {/* 3 Step Workflow */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-slate-100 text-left">
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                        <Zap className="w-4 h-4" />
                        1. Kamera / Paste Foto
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Gunakan webcam HD atau paste (Ctrl+V) foto e-KTP langsung dari clipboard PC Anda.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-4 h-4" />
                        2. Gemini 3.8 Flash
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        AI membaca 16 digit NIK, nama lengkap, tanggal lahir, dan alamat dengan koreksi karakter otomatis.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        3. Side-by-Side Review
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Tinjau foto fisik berdampingan dengan formulir sebelum disimpan permanen ke database Turso.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Desktop Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MyUPL Enterprise HR & Employee Information System • PT Ulu Plastik Latersia</span>
            <span className="font-mono text-[11px] text-slate-400">
              Turso SQLite • Cloudflare Pages Functions • Gemini 3.8 Flash
            </span>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEdit={(emp) => {
          setSelectedEmployee(null);
          setFormInitialData(emp);
          setIsFormModalOpen(true);
        }}
      />

      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormInitialData(null);
        }}
        onSave={handleSaveEmployee}
        departments={departments}
        initialData={formInitialData}
      />

      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onOcrSuccess={handleOcrSuccess}
      />
    </div>
  );
};
