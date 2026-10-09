import React, { useState, useMemo } from "react";
import {
  Printer,
  FileText,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
  Download,
  Info,
} from "lucide-react";
import type { Employee } from "../../types";

interface SalarySlipGeneratorProps {
  employees: Employee[];
}

// Indonesian Month Names
const NAMA_BULAN_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// PPh 21 TER (Tarif Efektif Rata-rata) - PP 58/2023 Function
export function hitungPPh21TER(bruto: number, status: string): number {
  // Categorize based on Status PTKP
  // Kategori A: TK/0, TK/1, K/0
  // Kategori B: TK/2, TK/3, K/1, K/2
  // Kategori C: K/3
  let kategori = "A";
  if (
    status === "TK/2" ||
    status === "TK/3" ||
    status === "K/1" ||
    status === "K/2"
  ) {
    kategori = "B";
  } else if (status === "K/3") {
    kategori = "C";
  }

  let tarif = 0; // dalam persen

  if (kategori === "A") {
    if (bruto <= 5400000) tarif = 0;
    else if (bruto <= 5650000) tarif = 0.25;
    else if (bruto <= 5950000) tarif = 0.5;
    else if (bruto <= 6300000) tarif = 0.75;
    else if (bruto <= 6750000) tarif = 1;
    else if (bruto <= 7500000) tarif = 1.25;
    else if (bruto <= 8550000) tarif = 1.5;
    else if (bruto <= 9650000) tarif = 1.75;
    else if (bruto <= 10950000) tarif = 2;
    else if (bruto <= 13000000) tarif = 3;
    else tarif = 5;
  } else if (kategori === "B") {
    if (bruto <= 6200000) tarif = 0;
    else if (bruto <= 6500000) tarif = 0.25;
    else if (bruto <= 6850000) tarif = 0.5;
    else if (bruto <= 7300000) tarif = 0.75;
    else if (bruto <= 7850000) tarif = 1;
    else if (bruto <= 8850000) tarif = 1.25;
    else if (bruto <= 9850000) tarif = 1.5;
    else if (bruto <= 10900000) tarif = 1.75;
    else if (bruto <= 12600000) tarif = 2;
    else tarif = 4;
  } else if (kategori === "C") {
    if (bruto <= 6600000) tarif = 0;
    else if (bruto <= 6950000) tarif = 0.25;
    else if (bruto <= 7350000) tarif = 0.5;
    else if (bruto <= 7800000) tarif = 0.75;
    else if (bruto <= 8350000) tarif = 1;
    else if (bruto <= 9450000) tarif = 1.25;
    else if (bruto <= 10650000) tarif = 1.5;
    else if (bruto <= 11850000) tarif = 1.75;
    else if (bruto <= 13800000) tarif = 2;
    else tarif = 3;
  }

  return Math.round(bruto * (tarif / 100));
}

// Rupiah formatting helper matching SLIP GAJI GENERATOR.html
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(angka || 0);
}

export const SalarySlipGenerator: React.FC<SalarySlipGeneratorProps> = ({
  employees,
}) => {
  // Current month default: YYYY-MM
  const now = new Date();
  const defaultYearMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  // Form States
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [bulanTahun, setBulanTahun] = useState<string>(defaultYearMonth);
  const [employeeId, setEmployeeId] = useState<string>("UPL-042");
  const [namaKaryawan, setNamaKaryawan] = useState<string>("Maringan Gamaliel");
  const [jabatan, setJabatan] = useState<string>("Pengawas Lapangan");
  const [sts, setSts] = useState<string>("K/3");
  const [namaDirektur, setNamaDirektur] = useState<string>("Rahmat Putra Jaya");

  // Earnings (Penerimaan)
  const [gajiPokok, setGajiPokok] = useState<number>(5500000);
  const [tunjangan, setTunjangan] = useState<number>(500000);
  const [lembur, setLembur] = useState<number>(0);
  const [transport, setTransport] = useState<number>(250000);
  const [uangMakan, setUangMakan] = useState<number>(1500000);
  const [bonus, setBonus] = useState<number>(0);

  // Deductions (Potongan)
  const [bpjsKes, setBpjsKes] = useState<number>(55000); // 1%
  const [jht, setJht] = useState<number>(110000); // 2%
  const [jp, setJp] = useState<number>(55000); // 1%
  const [potonganLain, setPotonganLain] = useState<number>(0);

  // Handler when Gaji Pokok changes -> Auto calculate standard BPJS
  const handleGajiPokokChange = (val: number) => {
    setGajiPokok(val);
    setBpjsKes(Math.round(val * 0.01));
    setJht(Math.round(val * 0.02));
    setJp(Math.round(val * 0.01));
  };

  // Quick select employee from database
  const handleSelectEmployee = (id: string) => {
    setSelectedEmpId(id);
    if (!id) return;
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setEmployeeId(emp.nik || emp.id);
      setNamaKaryawan(emp.fullName);
      setJabatan(emp.position || "Staff");

      // Auto deduce STS if marital status available
      if (emp.maritalStatus === "MENIKAH") {
        setSts("K/1");
      } else if (emp.maritalStatus === "BELUM_MENIKAH") {
        setSts("TK/0");
      }

      if (emp.salary && emp.salary > 0) {
        handleGajiPokokChange(emp.salary);
      }
    }
  };

  // Calculations
  const totalPenerimaan = useMemo(() => {
    return (
      (gajiPokok || 0) +
      (tunjangan || 0) +
      (lembur || 0) +
      (transport || 0) +
      (uangMakan || 0) +
      (bonus || 0)
    );
  }, [gajiPokok, tunjangan, lembur, transport, uangMakan, bonus]);

  const pph21 = useMemo(() => {
    return hitungPPh21TER(totalPenerimaan, sts);
  }, [totalPenerimaan, sts]);

  const totalPotongan = useMemo(() => {
    return (
      (bpjsKes || 0) +
      (jht || 0) +
      (jp || 0) +
      (potonganLain || 0) +
      (pph21 || 0)
    );
  }, [bpjsKes, jht, jp, potonganLain, pph21]);

  const takeHomePay = useMemo(() => {
    return totalPenerimaan - totalPotongan;
  }, [totalPenerimaan, totalPotongan]);

  // Formatted display date for the slip title
  const slipBulanDisplay = useMemo(() => {
    if (!bulanTahun) return "JUNI 2026";
    const parts = bulanTahun.split("-");
    if (parts.length === 2) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const bln = NAMA_BULAN_INDO[monthIdx] || parts[1];
      return `${bln.toUpperCase()} ${parts[0]}`;
    }
    return bulanTahun.toUpperCase();
  }, [bulanTahun]);

  const handleResetForm = () => {
    setSelectedEmpId("");
    setBulanTahun(defaultYearMonth);
    setEmployeeId("UPL-042");
    setNamaKaryawan("Maringan Gamaliel");
    setJabatan("Pengawas Lapangan");
    setSts("K/3");
    setNamaDirektur("Rahmat Putra Jaya");
    setGajiPokok(5500000);
    setTunjangan(500000);
    setLembur(0);
    setTransport(250000);
    setUangMakan(1500000);
    setBonus(0);
    setBpjsKes(55000);
    setJht(110000);
    setJp(55000);
    setPotonganLain(0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-specific style block to isolate only the printable slip and format onto standard A4 paper */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 20mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #slip-print-wrapper,
          #slip-print-wrapper * {
            visibility: visible !important;
          }
          #slip-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner / Description (no-print) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Generator & Cetak Slip Gaji PT Ulu Plastik Latersia
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hitung otomatis PPh 21 TER (PP 58/2023) & Potongan BPJS Kesehatan/Ketenagakerjaan. Cetak presisi A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetForm}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Reset formulir ke default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Slip Gaji (PDF / Printer)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Input Form Cards, Right = Live Paper Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form (no-print) */}
        <div className="lg:col-span-6 space-y-5 no-print">
          {/* Quick Database Selector */}
          <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Pilih Karyawan dari Database (Otomatis Isi)
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                {employees.length} Karyawan
              </span>
            </div>
            <select
              value={selectedEmpId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih karyawan untuk auto-fill (Opsional) --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nik || emp.id} - {emp.fullName} ({emp.position || "Staff"} • {emp.departmentName || "Departemen"})
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Data Karyawan & Periode */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Data Karyawan & Periode
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bulan & Tahun Gaji
                </label>
                <input
                  type="month"
                  value={bulanTahun}
                  onChange={(e) => setBulanTahun(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ID Karyawan (NIK)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Mis: UPL-042"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Karyawan
                </label>
                <input
                  type="text"
                  value={namaKaryawan}
                  onChange={(e) => setNamaKaryawan(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Mis: Pengawas Lapangan"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Status PTKP / Tanggungan (STS)
                </label>
                <select
                  value={sts}
                  onChange={(e) => setSts(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TK/0">TK/0 (Belum Menikah, 0 Tanggungan - Kat. A)</option>
                  <option value="K/0">K/0 (Menikah, 0 Tanggungan - Kat. A)</option>
                  <option value="K/1">K/1 (Menikah, 1 Tanggungan - Kat. B)</option>
                  <option value="K/2">K/2 (Menikah, 2 Tanggungan - Kat. B)</option>
                  <option value="K/3">K/3 (Menikah, 3 Tanggungan - Kat. C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Penanggung Jawab / HR
                </label>
                <input
                  type="text"
                  value={namaDirektur}
                  onChange={(e) => setNamaDirektur(e.target.value)}
                  placeholder="Mis: Rahmat Putra Jaya"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Detail Penerimaan */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Detail Penerimaan (Pendapatan)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Gaji Pokok (Rp)
                </label>
                <input
                  type="number"
                  value={gajiPokok}
                  onChange={(e) => handleGajiPokokChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  *Otomatis update standar default BPJS (1% Kes, 2% JHT, 1% JP)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tunjangan Jabatan / Lainnya (Rp)
                </label>
                <input
                  type="number"
                  value={tunjangan}
                  onChange={(e) => setTunjangan(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lembur (Rp)
                </label>
                <input
                  type="number"
                  value={lembur}
                  onChange={(e) => setLembur(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Transport (Rp)
                </label>
                <input
                  type="number"
                  value={transport}
                  onChange={(e) => setTransport(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Uang Makan (Rp)
                </label>
                <input
                  type="number"
                  value={uangMakan}
                  onChange={(e) => setUangMakan(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bonus / Insentif (Rp)
                </label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detail Potongan & Pajak */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Detail Potongan & PPh 21 Otomatis
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  BPJS Kesehatan (Rp){" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    (1% Pekerja)
                  </span>
                </label>
                <input
                  type="number"
                  value={bpjsKes}
                  onChange={(e) => setBpjsKes(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  BPJS TK - JHT (Rp){" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    (2% Pekerja)
                  </span>
                </label>
                <input
                  type="number"
                  value={jht}
                  onChange={(e) => setJht(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  BPJS TK - JP (Rp){" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    (1% Pekerja)
                  </span>
                </label>
                <input
                  type="number"
                  value={jp}
                  onChange={(e) => setJp(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Potongan Lain-lain (Rp)
                </label>
                <input
                  type="number"
                  value={potonganLain}
                  onChange={(e) => setPotonganLain(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  Pajak PPh 21 Otomatis (TER Bulanan PP 58/2023)
                </label>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-rose-800 font-semibold">
                    Terhitung otomatis berdasarkan Bruto Rp {formatRupiah(totalPenerimaan)} ({sts}):
                  </span>
                  <span className="text-sm font-bold text-rose-700 font-mono">
                    Rp {formatRupiah(pph21)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Printable Slip Preview */}
        <div className="lg:col-span-6 w-full">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-2 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                Live Preview Slip Gaji (Ukuran Kertas Standar)
              </span>
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Cetak Langsung &rarr;
              </button>
            </div>

            {/* Printable Slip Container matching SLIP GAJI GENERATOR.html */}
            <div
              id="slip-print-wrapper"
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-slate-900 transition-all font-sans"
              style={{ minHeight: "560px" }}
            >
              {/* Header Company */}
              <table
                className="w-full pb-3 mb-4"
                style={{ borderBottom: "3px double #000000" }}
              >
                <tbody>
                  <tr>
                    <td className="w-24 text-center align-middle pr-3">
                      <img
                        src="/logo-slip.png"
                        alt="PT ULU PLASTIK LATERSIA Logo"
                        className="max-h-20 max-w-[84px] object-contain mx-auto"
                      />
                    </td>
                    <td className="align-middle pl-2">
                      <h2 className="text-xl font-bold text-black uppercase tracking-wide leading-tight m-0">
                        PT. ULU PLASTIK LATERSIA
                      </h2>
                      <p className="text-[11px] text-slate-700 mt-1 leading-snug m-0">
                        Ds. Klating RT.03 RW.07 Suwayuwo, Pasuruan – Jawa Timur
                        <br />
                        Telp: +62 821-4320-3848 | Website: www.uluplastik.com
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Document Title */}
              <div className="text-center font-bold text-sm tracking-wider uppercase my-4">
                SLIP GAJI BULAN {slipBulanDisplay}
              </div>

              {/* Employee Info Grid */}
              <table className="w-full text-xs mb-4">
                <tbody>
                  <tr>
                    <td className="w-[15%] py-1 font-medium text-slate-700">ID</td>
                    <td className="w-[35%] py-1">
                      : <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">{employeeId}</span>
                    </td>
                    <td className="w-[15%] py-1 font-medium text-slate-700">JABATAN</td>
                    <td className="w-[35%] py-1 font-semibold">: {jabatan}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-slate-700">NAMA</td>
                    <td className="py-1 font-bold text-slate-900">: {namaKaryawan}</td>
                    <td className="py-1 font-medium text-slate-700">STS</td>
                    <td className="py-1 font-semibold">: {sts}</td>
                  </tr>
                </tbody>
              </table>

              {/* Financial Breakdown Table: Penerimaan vs Potongan */}
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                    <th className="w-1/2 text-left py-1.5 px-2 font-bold uppercase border-r border-slate-300">
                      Penerimaan
                    </th>
                    <th className="w-1/2 text-left py-1.5 px-2 font-bold uppercase">
                      Potongan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* Left Sub-table: Penerimaan */}
                    <td className="align-top border-r border-slate-300 p-0">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Gaji Pokok</td>
                            <td className="py-1 text-right w-3 text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(gajiPokok)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Tunjangan</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(tunjangan)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Lembur</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(lembur)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Transport</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(transport)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Uang Makan</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(uangMakan)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Bonus</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(bonus)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* Right Sub-table: Potongan */}
                    <td className="align-top p-0">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">BPJS Kesehatan</td>
                            <td className="py-1 text-right w-3 text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(bpjsKes)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">BPJS TK - JHT</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(jht)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">BPJS TK - JP</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(jp)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-slate-700">Potongan Lain</td>
                            <td className="py-1 text-right text-slate-400">:</td>
                            <td className="py-1 px-2 text-right font-mono">{formatRupiah(potonganLain)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-rose-700 font-semibold">PPh 21 (Pajak)</td>
                            <td className="py-1 text-right text-rose-700 font-semibold">:</td>
                            <td className="py-1 px-2 text-right font-mono text-rose-700 font-semibold">
                              {formatRupiah(pph21)}
                            </td>
                          </tr>
                          {/* Blank spacer row */}
                          <tr>
                            <td className="py-1 px-2">&nbsp;</td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Subtotal Row */}
                  <tr style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                    <td className="border-r border-slate-300 p-0 font-bold">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="py-2 px-2 text-black">TOTAL PENERIMAAN</td>
                            <td className="py-2 text-right w-3 text-black">:</td>
                            <td className="py-2 px-2 text-right font-mono text-black">{formatRupiah(totalPenerimaan)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="p-0 font-bold">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="py-2 px-2 text-black">TOTAL POTONGAN</td>
                            <td className="py-2 text-right w-3 text-black">:</td>
                            <td className="py-2 px-2 text-right font-mono text-black">{formatRupiah(totalPotongan)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Take Home Pay (THP) Box */}
              <div className="my-5 text-sm font-bold flex items-center">
                <span className="w-32 tracking-wider">THP :</span>
                <span
                  className="font-mono text-base font-extrabold pb-0.5"
                  style={{ borderBottom: "3px double #000000" }}
                >
                  Rp {formatRupiah(takeHomePay)}
                </span>
              </div>

              {/* Dual Signatures */}
              <table className="w-full mt-8 text-xs text-center">
                <tbody>
                  <tr>
                    <td className="w-1/2 align-top">
                      <span>Mengetahui,</span>
                      <div className="h-16"></div>
                      <span className="font-bold underline text-black">
                        {namaDirektur}
                      </span>
                      <br />
                      <span className="text-slate-600 text-[11px]">HR Manager</span>
                    </td>
                    <td className="w-1/2 align-top">
                      <span>Diterima Oleh,</span>
                      <div className="h-16"></div>
                      <span className="font-bold underline text-black">
                        {namaKaryawan}
                      </span>
                      <br />
                      <span className="text-slate-600 text-[11px]">Karyawan</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
