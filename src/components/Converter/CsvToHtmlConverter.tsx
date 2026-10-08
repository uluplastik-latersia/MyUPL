import React, { useState, useRef, useMemo } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Printer,
  Download,
  Search,
  RotateCcw,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";

// Color classes corresponding to original APLIKASI KONVERT DATA CSV KE HTML.html
const FAMILY_BG_COLORS = [
  "bg-blue-100/75 border-l-4 border-l-blue-500",
  "bg-emerald-100/75 border-l-4 border-l-emerald-500",
  "bg-yellow-100/75 border-l-4 border-l-amber-500",
  "bg-purple-100/75 border-l-4 border-l-purple-500",
  "bg-pink-100/75 border-l-4 border-l-pink-500",
  "bg-orange-100/75 border-l-4 border-l-orange-500",
  "bg-teal-100/75 border-l-4 border-l-teal-500",
  "bg-indigo-100/75 border-l-4 border-l-indigo-500",
];

const FAMILY_HEX_COLORS = [
  { bg: "#dbeafe", border: "#3b82f6" },
  { bg: "#dcfce7", border: "#22c55e" },
  { bg: "#fef9c3", border: "#eab308" },
  { bg: "#f3e8ff", border: "#a855f7" },
  { bg: "#fce7f3", border: "#ec4899" },
  { bg: "#ffedd5", border: "#f97316" },
  { bg: "#ccfbf1", border: "#14b8a6" },
  { bg: "#e0e7ff", border: "#6366f1" },
];

/**
 * Robust CSV parser supporting commas, semicolons, pipe, and multiline/escaped quoted cells
 */
function parseRawCsv(csvText: string): { headers: string[]; rows: string[][] } {
  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  // Determine primary delimiter from first line (defaulting to comma or semicolon)
  const firstLine = csvText.split(/\r?\n/)[0] || "";
  let delimiter = ",";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const pipes = (firstLine.match(/\|/g) || []).length;

  if (semicolons > commas && semicolons > pipes) delimiter = ";";
  else if (pipes > commas && pipes > semicolons) delimiter = "|";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentCell.trim());
      if (currentRow.length > 0 && currentRow.some((c) => c !== "")) {
        result.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  // Last remaining cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== "")) {
      result.push(currentRow);
    }
  }

  if (result.length === 0) return { headers: [], rows: [] };

  const headers = result[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows = result.slice(1).map((row) =>
    row.map((cell) => cell.replace(/^["']|["']$/g, "").trim())
  );

  return { headers, rows };
}

export const CsvToHtmlConverter: React.FC = () => {
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column auto-detection
  const { jknIndex, hubIndex } = useMemo(() => {
    const jknRegex = /no.*jkn.*pekerja|jkn.*pekerja|nojknpekerja|jkn/i;
    const hubRegex = /hubungan.*keluarga|hub.*keluarga|hubungan/i;

    let foundJkn = headers.findIndex((h) => jknRegex.test(h));
    let foundHub = headers.findIndex((h) => hubRegex.test(h));

    return {
      jknIndex: foundJkn !== -1 ? foundJkn : 0,
      hubIndex: foundHub !== -1 ? foundHub : -1,
    };
  }, [headers]);

  // Statistics & Family color mapping
  const {
    totalPeserta,
    totalFamilies,
    totalIstri,
    totalAnak,
    familyColorMap,
  } = useMemo(() => {
    const counts: Record<string, number> = {};
    let peserta = 0;
    let istri = 0;
    let anak = 0;

    rawRows.forEach((row) => {
      const jknVal = (row[jknIndex] || "").trim();
      if (jknVal && jknVal !== "-" && jknVal !== "0") {
        counts[jknVal] = (counts[jknVal] || 0) + 1;
      }

      if (hubIndex !== -1) {
        const hubVal = (row[hubIndex] || "").trim().toUpperCase();
        if (hubVal === "PESERTA") peserta++;
        else if (hubVal.includes("ISTRI")) istri++;
        else if (hubVal.includes("ANAK")) anak++;
      } else {
        row.forEach((cell) => {
          const val = (cell || "").trim().toUpperCase();
          if (val === "PESERTA") peserta++;
          else if (val.includes("ISTRI")) istri++;
          else if (val.includes("ANAK")) anak++;
        });
      }
    });

    const fMap: Record<string, number> = {};
    let colorCounter = 0;
    let familiesCount = 0;

    Object.keys(counts).forEach((jknVal) => {
      if (counts[jknVal] > 1) {
        fMap[jknVal] = colorCounter % 8;
        colorCounter++;
        familiesCount++;
      }
    });

    return {
      totalPeserta: peserta,
      totalFamilies: familiesCount,
      totalIstri: istri,
      totalAnak: anak,
      familyColorMap: fMap,
    };
  }, [rawRows, jknIndex, hubIndex, headers]);

  // Filtered rows based on search input
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rawRows;
    const q = searchQuery.toLowerCase();
    return rawRows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(q))
    );
  }, [rawRows, searchQuery]);

  const handleProcessFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const { headers: parsedHeaders, rows: parsedRows } = parseRawCsv(content);
      setHeaders(parsedHeaders);
      setRawRows(parsedRows);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleReset = () => {
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setSearchQuery("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Standalone HTML file identical to original format
  const handleDownloadHtml = () => {
    const jknColName = headers[jknIndex] || "NoJKNPekerja";
    const printDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build the standalone HTML table
    let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:7.5pt; font-family:sans-serif;">
      <thead>
        <tr style="background:#f1f5f9; text-transform:uppercase; font-size:7pt; font-weight:bold; border-bottom:1px solid #94a3b8;">
          <th style="padding:4px 6px; border:0.5px solid #475569; text-align:center;">#</th>
          ${headers
            .map((h, i) => {
              const bg =
                i === jknIndex
                  ? "#dbeafe; color:#1e3a8a;"
                  : i === hubIndex
                  ? "#dcfce7; color:#14532d;"
                  : "";
              return `<th style="padding:4px 6px; border:0.5px solid #475569; text-align:left; background:${bg}">${h}</th>`;
            })
            .join("")}
        </tr>
      </thead>
      <tbody>`;

    rawRows.forEach((row, idx) => {
      const jknVal = (row[jknIndex] || "").trim();
      const colorIdx = familyColorMap[jknVal];
      const isFamily = colorIdx !== undefined;
      const hex = isFamily ? FAMILY_HEX_COLORS[colorIdx] : null;

      const rowStyle = isFamily
        ? `background-color:${hex?.bg}; border-left:3px solid ${hex?.border};`
        : "";

      tableHtml += `<tr style="${rowStyle}">
        <td style="padding:3px 5px; border:0.5px solid #475569; text-align:center; font-family:monospace; font-size:7pt;">${
          idx + 1
        }</td>`;

      row.forEach((cell, cIdx) => {
        let val = cell || "";
        const isJknCol = cIdx === jknIndex;
        const isHubCol = cIdx === hubIndex;

        if (isJknCol && isFamily) {
          val = `<strong>👥 ${val}</strong>`;
        } else if (isHubCol) {
          const u = val.toUpperCase();
          if (u === "PESERTA") {
            val = `<span style="background:#e0e7ff; color:#3730a3; padding:1px 4px; border-radius:3px; font-weight:bold; font-size:6.5pt;">${val}</span>`;
          } else if (u.includes("ISTRI")) {
            val = `<span style="background:#fce7f3; color:#9d174d; padding:1px 4px; border-radius:3px; font-weight:bold; font-size:6.5pt;">${val}</span>`;
          } else if (u.includes("ANAK")) {
            val = `<span style="background:#d1fae5; color:#065f46; padding:1px 4px; border-radius:3px; font-weight:bold; font-size:6.5pt;">${val}</span>`;
          }
        }

        tableHtml += `<td style="padding:3px 5px; border:0.5px solid #475569; ${
          isJknCol ? "font-weight:600;" : ""
        }">${val}</td>`;
      });

      tableHtml += "</tr>";
    });

    tableHtml += `</tbody></table>`;

    const htmlDocument = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tabel Data Keluarga JKN (${jknColName}) - Landscape A4</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 4mm 5mm; }
      html, body { width: 100% !important; background: #fff !important; font-size: 7.5pt !important; margin: 0 !important; padding: 0 !important; }
      *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
      thead { display: table-header-group !important; }
      tr { page-break-inside: avoid !important; }
      th, td { padding: 2.5px 3px !important; border: 0.5px solid #475569 !important; white-space: normal !important; word-break: break-word !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 p-4 sm:p-6 font-sans">
  <div class="max-w-7xl mx-auto space-y-4">
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center no-print">
      <div>
        <h1 class="text-lg font-bold text-slate-800">Tabel Data Terkonversi JKN BPJS</h1>
        <p class="text-xs text-slate-500 mt-1">
          Total Peserta: <b>${totalPeserta}</b> | Kelompok Keluarga: <b>${totalFamilies}</b> | Total Istri: <b>${totalIstri}</b> | Total Anak: <b>${totalAnak}</b> | Dicetak: ${printDate}
        </p>
      </div>
      <div class="flex gap-2">
        <button onclick="window.print()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow transition">
          🖨️ Cetak A4 Landscape / PDF
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto p-4">
      ${tableHtml}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Data_Keluarga_JKN_A4_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-Only Style Definition for Browser Window Print */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm 5mm 4mm 5mm;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 7.2pt !important;
          }
          th, td {
            padding: 2.5px 3px !important;
            border: 0.5px solid #475569 !important;
            white-space: normal !important;
            word-break: break-word !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Upload Zone (If no data loaded yet) */}
      {headers.length === 0 ? (
        <div className="max-w-2xl mx-auto my-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`bg-white rounded-3xl p-10 sm:p-14 border-2 border-dashed transition-all text-center ${
              dragOver
                ? "border-blue-500 bg-blue-50/50 shadow-lg"
                : "border-slate-300 hover:border-blue-400 shadow-sm"
            }`}
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm border border-blue-100">
              <UploadCloud className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Unggah File CSV Data JKN / Karyawan
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Konversi instan ke tampilan tabel HTML A4 Landscape tanpa disimpan ke database. Otomatis mendeteksi kelompok keluarga, hubungan keluarga, dan format warna pastel.
            </p>

            <div className="inline-flex flex-col items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt"
                onChange={handleFileInputChange}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Pilih Berkas CSV
              </label>
              <span className="text-[11px] text-slate-400">
                Mendukung pemisah koma (<code>,</code>), titik koma (<code>;</code>), atau pipa (<code>|</code>)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Loaded View: Controls, KPI Cards, and HTML Table */
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>{fileName || "Data CSV Terkonversi"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-200">
                    {rawRows.length} Baris
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Preview HTML Presisi A4 Landscape • Siap Cetak atau Diunduh Standalone
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition"
                title="Cetak A4 Landscape atau Simpan sebagai PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak A4 / PDF</span>
              </button>

              <button
                onClick={handleDownloadHtml}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition"
                title="Unduh sebagai file HTML mandiri"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File HTML</span>
              </button>

              <button
                onClick={handleReset}
                className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition border border-slate-200 flex items-center gap-1.5"
                title="Ganti Berkas CSV"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ganti File</span>
              </button>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Total Peserta
              </p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                  {totalPeserta}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-lg border border-blue-100">
                  Pekerja
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Kelompok Keluarga
              </p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-purple-600 tracking-tight">
                  {totalFamilies}
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-lg border border-purple-100">
                  KK Unik
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Total Istri
              </p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-pink-600 tracking-tight">
                  {totalIstri}
                </span>
                <span className="text-xs bg-pink-50 text-pink-700 font-bold px-2 py-0.5 rounded-lg border border-pink-100">
                  Tanggungan
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Total Anak
              </p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                  {totalAnak}
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg border border-emerald-100">
                  Tanggungan
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar & Legend */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIK, Faskes, dll..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-400 inline-block shrink-0" />
              <span>Warna Pastel = 1 Kelompok Anggota Keluarga</span>
            </div>
          </div>

          {/* Table Container (Printable Area) */}
          <div
            id="print-area"
            className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden p-4 sm:p-6"
          >
            {/* Header Cetak Presisi (Hanya tampak saat print) */}
            <div className="hidden print:block mb-3 pb-2 border-b-2 border-slate-800">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Laporan Rekapitulasi Data Peserta & Keluarga JKN
                  </h1>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Dicetak Pada: {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} | Format: A4 Landscape Presisi
                  </p>
                </div>
                <div className="text-[10px] text-slate-700 font-bold flex gap-3">
                  <span>Peserta: {totalPeserta}</span>
                  <span>Kelompok: {totalFamilies}</span>
                  <span>Istri: {totalIstri}</span>
                  <span>Anak: {totalAnak}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-300">
                    <th className="py-2.5 px-2 w-8 text-center border border-slate-300">
                      #
                    </th>
                    {headers.map((h, idx) => {
                      const isJknCol = idx === jknIndex;
                      const isHubCol = idx === hubIndex;
                      return (
                        <th
                          key={idx}
                          className={`py-2.5 px-3 border border-slate-300 ${
                            isJknCol
                              ? "bg-blue-50 text-blue-900 font-bold"
                              : isHubCol
                              ? "bg-emerald-50 text-emerald-900 font-bold"
                              : ""
                          }`}
                        >
                          {h}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((row, rIdx) => {
                    const jknVal = (row[jknIndex] || "").trim();
                    const colorIdx = familyColorMap[jknVal];
                    const isFamily = colorIdx !== undefined;
                    const rowColorClass = isFamily
                      ? FAMILY_BG_COLORS[colorIdx]
                      : "hover:bg-slate-50";

                    return (
                      <tr
                        key={rIdx}
                        className={`${rowColorClass} transition-colors`}
                      >
                        <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border border-slate-300">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => {
                          const isJknCol = cIdx === jknIndex;
                          const isHubCol = cIdx === hubIndex;
                          const cellUpper = (cell || "").trim().toUpperCase();

                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-3 border border-slate-300 text-slate-700 ${
                                isJknCol ? "font-semibold" : ""
                              }`}
                            >
                              {isJknCol && isFamily ? (
                                <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0 no-print" />
                                  <span>{cell}</span>
                                </span>
                              ) : isHubCol ? (
                                cellUpper === "PESERTA" ? (
                                  <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                                    {cell}
                                  </span>
                                ) : cellUpper.includes("ISTRI") ? (
                                  <span className="inline-block bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-200">
                                    {cell}
                                  </span>
                                ) : cellUpper.includes("ANAK") ? (
                                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                    {cell}
                                  </span>
                                ) : (
                                  cell
                                )
                              ) : (
                                cell
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRows.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">Tidak ada baris yang sesuai dengan pencarian Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
