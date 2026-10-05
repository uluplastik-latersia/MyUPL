import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";
import type { Employee, Department } from "../../types";
import { downloadEmployeeCsvTemplate, parseEmployeeCsv } from "../../lib/utils";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onImportSuccess: (importedCount: number) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  departments,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Employee>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failedItems, setFailedItems] = useState<
    Array<{ name: string; nik: string; reason: string }>
  >([]);
  const [successCountTotal, setSuccessCountTotal] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setParseErrors([]);
    setParsedData([]);
    setFailedItems([]);
    setSuccessCountTotal(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setParseErrors(["File CSV tidak berisi konten atau kosong."]);
        return;
      }
      const { valid, errors } = parseEmployeeCsv(text, departments);
      setParsedData(valid);
      setParseErrors(errors);
    };
    reader.onerror = () => {
      setParseErrors(["Gagal membaca file CSV. Pastikan format file valid."]);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type.includes("csv")) {
        handleFileChange(file);
      } else {
        setParseErrors(["Hanya file berekstensi .csv yang didukung."]);
      }
    }
  };

  const handleExecuteImport = async () => {
    if (parsedData.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setFailedItems([]);
      setSuccessCountTotal(null);

      let successCount = 0;
      const failures: Array<{ name: string; nik: string; reason: string }> = [];
      const total = parsedData.length;

      for (let i = 0; i < total; i++) {
        const emp = parsedData[i];
        try {
          const res = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emp),
          });
          const result = (await res.json().catch(() => null)) as any;

          if (res.ok && result?.success) {
            successCount++;
          } else {
            const errDetail =
              result?.error ||
              (result?.details
                ? Object.entries(result.details)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                : "Gagal menyimpan baris.");
            failures.push({
              name: emp.fullName || `Baris ${i + 1}`,
              nik: emp.nik || "-",
              reason: errDetail,
            });
          }
        } catch (e: any) {
          failures.push({
            name: emp.fullName || `Baris ${i + 1}`,
            nik: emp.nik || "-",
            reason: e.message || "Network error",
          });
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setSuccessCountTotal(successCount);
      setFailedItems(failures);

      if (successCount > 0) {
        onImportSuccess(successCount);
      }

      // If all succeeded with no failures, auto close after 1.5 seconds
      if (failures.length === 0 && successCount > 0) {
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setParseErrors([`Terjadi kesalahan saat menyimpan data: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData([]);
    setParseErrors([]);
    setFailedItems([]);
    setSuccessCountTotal(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full p-6 text-left transform transition-all animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Import Data Karyawan (CSV)
              </h3>
              <p className="text-xs text-slate-400">
                Sesuai Form Pendaftaran Karyawan Baru MyUPL
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Download Template Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-blue-900">
                Unduh Template CSV Terbaru
              </div>
              <p className="text-[11px] text-blue-700/80">
                Lengkap dengan kolom Departemen, Gaji, Sistem Penggajian, BPJS, & Status Kerja.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadEmployeeCsvTemplate()}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              selectedFile
                ? "border-blue-400 bg-blue-50/20"
                : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <UploadCloud className="w-9 h-9 mx-auto text-blue-500 mb-2 stroke-[1.8]" />
            {selectedFile ? (
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Tarik & Lepaskan file CSV Anda ke sini
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Atau klik untuk memilih file dari komputer (.csv)
                </p>
              </div>
            )}
          </div>

          {/* Validation & Errors Summary */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Peringatan / Catatan Format:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 max-h-24 overflow-y-auto">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Siap diimpor: <strong className="text-blue-600">{parsedData.length} Data</strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Menampilkan preview 3 baris pertama
                </span>
              </div>

              <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-3">NIK</th>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Gender</th>
                      <th className="py-2 px-3">Departemen</th>
                      <th className="py-2 px-3">Jabatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {parsedData.slice(0, 3).map((item, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="py-2 px-3 font-mono text-slate-600">{item.nik}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {item.fullName}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item.gender}</td>
                        <td className="py-2 px-3 text-slate-600">{item.departmentName}</td>
                        <td className="py-2 px-3 text-slate-600">{item.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  Mengunggah data ke database...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {/* Import Result Feedback */}
          {successCountTotal !== null && successCountTotal > 0 && failedItems.length === 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-emerald-900 font-bold">Import Berhasil!</strong>
                <span>{successCountTotal} data karyawan baru berhasil disimpan ke database.</span>
              </div>
            </div>
          )}

          {failedItems.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Laporan Hasil: {successCountTotal || 0} Berhasil, {failedItems.length} Gagal
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Berikut baris data yang ditolak oleh sistem:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {failedItems.map((fail, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/90 border border-amber-200/70 text-[11px] text-slate-700"
                  >
                    <div className="font-bold text-slate-900">
                      {fail.name} (NIK: {fail.nik})
                    </div>
                    <div className="text-rose-600 text-[10px] mt-0.5">{fail.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="py-2.5 px-5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isProcessing || parsedData.length === 0}
            onClick={handleExecuteImport}
            className="py-2.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Import {parsedData.length} Data Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
