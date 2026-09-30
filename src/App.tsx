import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
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
} from "lucide-react";
import type { Employee, Department, AnalyticsData, KtpOcrResult } from "./types";

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

  // Fetch Core Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Build queries with filters
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchData}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
        expiringCount={analytics.metrics.totalExpiring}
      />

      {/* System Notice Toast */}
      {systemNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full animate-in fade-in">
          <div className="p-3 bg-indigo-600/90 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{systemNotice}</span>
            </div>
            <button onClick={() => setSystemNotice(null)} className="underline text-[11px]">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE HR DASHBOARD                                              */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Global Filters */}
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

            {/* KPI Metric Cards */}
            <MetricCards
              metrics={analytics.metrics}
              onExpiringClick={() => {
                const el = document.getElementById("contract-alerts-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Smart Contract Reminder Widget */}
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <GenderChart data={analytics.charts.genderDistribution} />
              <EmploymentStatusChart data={analytics.charts.employmentStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AgePyramidChart data={analytics.charts.agePyramid} />
              <TenureChart data={analytics.charts.tenureDistribution} />
            </div>

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
                  setSystemNotice("Karyawan baru hasil pindai KTP berhasil diverifikasi dan disimpan!");
                  await fetchData();
                  setActiveTab("directory");
                }}
              />
            ) : (
              <div className="glass-panel rounded-2xl border-slate-800 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/25 border border-indigo-400/30">
                  <Camera className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Onboarding Cepat dengan AI OCR Scanner
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Pindai e-KTP atau Kartu Keluarga langsung menggunakan kamera perangkat Anda. AI
                    Google Gemini 1.5 Flash akan mengekstrak 16-digit NIK, Nama, Tanggal Lahir, dan
                    Alamat secara otomatis ke dalam formulir.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Buka Kamera Pindai KTP</span>
                  </button>
                </div>

                {/* Workflow Feature Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      1. Kamera & Canvas
                    </div>
                    <p className="text-xs text-slate-400">
                      Auto-crop dengan panduan KTP dan kompresi kanvas di bawah 600 KB tanpa lag.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      2. Gemini Flash AI
                    </div>
                    <p className="text-xs text-slate-400">
                      Mengekstrak data kependudukan secara akurat dengan schema JSON terstruktur.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      3. Review & Simpan
                    </div>
                    <p className="text-xs text-slate-400">
                      Verifikasi berdampingan (gambar vs form) dan validasi Zod sebelum masuk database.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MyUPL Enterprise HR & Employee Data Management System</span>
          <span className="font-mono text-[11px] text-slate-600">
            Powered by Turso libSQL • Cloudflare Pages Edge • Gemini 1.5 Flash
          </span>
        </div>
      </footer>

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
