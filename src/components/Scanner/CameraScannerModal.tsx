import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  X,
  Upload,
  RefreshCw,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { compressImageOnCanvas } from "../../lib/utils";
import type { KtpOcrResult } from "../../types";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOcrSuccess: (ocrData: KtpOcrResult, imageBase64: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onOcrSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);

  // Start Camera Stream
  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    setCameraError("");
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(
        "Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan tombol 'Unggah Foto' sebagai gantinya."
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      setCapturedBase64(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Flip Camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Perform Gemini OCR Call
  const executeOcrCall = async (base64Image: string) => {
    setIsProcessing(true);
    setProcessingStatus("Mengompresi gambar & menghubungi Edge Gemini OCR...");

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: "image/jpeg",
        }),
      });

      const resData = (await response.json()) as any;

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Gagal memproses OCR.");
      }

      setProcessingStatus("Ekstraksi KTP berhasil! Membuka formulir review...");
      setTimeout(() => {
        onOcrSuccess(resData.data, base64Image);
      }, 500);
    } catch (err: any) {
      setCameraError(
        `OCR Error: ${err.message}. Pastikan KTP terlihat jelas dan coba lagi.`
      );
      setIsProcessing(false);
    }
  };

  // Capture from live video stream
  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      setIsProcessing(true);
      setProcessingStatus("Mengambil gambar dari sensor...");

      const compressed = await compressImageOnCanvas(videoRef.current, 1280, 580 * 1024);
      setCapturedPreview(compressed.dataUrl);
      setCapturedBase64(compressed.base64);

      // Stop camera once captured
      stopCamera();

      // Proceed to OCR
      await executeOcrCall(compressed.base64);
    } catch (err: any) {
      setCameraError(err.message || "Gagal memproses gambar.");
      setIsProcessing(false);
    }
  };

  // Handle File Input Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setProcessingStatus("Memproses & mengompresi berkas KTP...");

      const compressed = await compressImageOnCanvas(file, 1280, 580 * 1024);
      setCapturedPreview(compressed.dataUrl);
      setCapturedBase64(compressed.base64);
      stopCamera();

      await executeOcrCall(compressed.base64);
    } catch (err: any) {
      setCameraError(err.message || "Gagal membaca berkas gambar.");
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBase64(null);
    setIsProcessing(false);
    setCameraError("");
    startCamera(facingMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Pindai e-KTP / Kartu Keluarga
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Posisikan KTP pas di dalam bingkai panduan
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Scanner Area */}
        <div className="relative flex-1 bg-black min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            /* Image Preview */
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={capturedPreview}
                alt="Captured KTP"
                className="max-h-[360px] object-contain rounded-xl border border-slate-700 shadow-xl"
              />
            </div>
          ) : (
            /* Live Camera Stream with KTP Card Overlay */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* KTP Guide Box Overlay (Standard Card Ratio 1.586) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-full max-w-md aspect-[1.586] relative rounded-2xl border-2 border-dashed border-indigo-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] flex flex-col justify-between p-4">
                  {/* Corner Target Accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl -mb-1 -mr-1" />

                  {/* Header Hint Inside Box */}
                  <div className="text-center">
                    <span className="inline-block bg-slate-900/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-700 backdrop-blur">
                      KARTU TANDA PENDUDUK REPUBLIK INDONESIA
                    </span>
                  </div>

                  {/* Laser Scanning Animation Bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#34D399]" />

                  {/* Bottom Hint */}
                  <div className="text-center">
                    <span className="text-[11px] text-slate-300 font-medium bg-slate-900/80 px-2.5 py-0.5 rounded-full">
                      Pastikan NIK & Teks Terbaca Terang
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Processing Indicator Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white tracking-tight">
                Memproses Ekstraksi AI...
              </h4>
              <p className="mt-1 text-xs text-indigo-300 text-center max-w-sm">
                {processingStatus}
              </p>
            </div>
          )}

          {/* Error Message Toast */}
          {cameraError && !isProcessing && (
            <div className="absolute bottom-4 left-4 right-4 bg-rose-500/90 text-white p-3 rounded-xl border border-rose-400 shadow-xl flex items-center justify-between text-xs z-30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
              {capturedPreview && (
                <button
                  onClick={handleRetake}
                  className="ml-2 font-bold underline shrink-0"
                >
                  Ulangi
                </button>
              )}
            </div>
          )}
        </div>

        {/* Controls & Action Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* File Upload Option */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Unggah Berkas</span>
            <span className="sm:hidden">Unggah</span>
          </button>

          {/* Primary Action Button */}
          {capturedPreview ? (
            <button
              onClick={handleRetake}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ambil Ulang</span>
            </button>
          ) : (
            <button
              onClick={handleCapturePhoto}
              disabled={!cameraActive || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-40"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto KTP</span>
            </button>
          )}

          {/* Flip Camera Button */}
          {!capturedPreview && (
            <button
              onClick={toggleFacingMode}
              disabled={!cameraActive || isProcessing}
              title="Ganti Kamera Depan/Belakang"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
