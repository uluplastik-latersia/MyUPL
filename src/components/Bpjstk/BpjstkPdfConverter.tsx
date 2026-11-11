import React, { useState, useRef, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  FileText,
  UploadCloud,
  Printer,
  Download,
  Search,
  RotateCcw,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileSpreadsheet,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Hash,
} from "lucide-react";

// Set PDF.js worker
if (typeof window !== "undefined" && "Worker" in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn("Could not set PDF.js workerSrc:", e);
  }
}

export interface BpjstkHeader {
  formName: string; // "Formulir 2a PU"
  reportTitle: string; // "RINCIAN IURAN TENAGA KERJA"
  npp: string; // e.g. "21111722"
  companyName: string; // e.g. "ULU PLASTIK LATERSIA HARIAN LEPAS"
  unitName: string; // e.g. "ULU PLASTIK LATERSIA HARIAN LEPAS"
  reportPeriod: string; // e.g. "12 2026"
  reportMonth: string; // "12"
  reportYear: string; // "2026"
}

export interface BpjstkRow {
  no: number;
  nomorReferensi: string; // KPJ
  nik: string; // 16 digit NIK
  nomorPegawai: string; // optional
  namaTenagaKerja: string;
  tanggalLahir: string; // DD-MM-YYYY
  tglKepesertaan: string; // DD-MM-YYYY
  jumlahUpah: number;
  jumlahRapel: number;
  iuranJkk: number;
  iuranJkm: number;
  jhtPemberiKerja: number;
  jhtTenagaKerja: number;
  jpPemberiKerja: number;
  jpTenagaKerja: number;
  jkpPemberiKerja: number;
  jkpPemerintah: number;
  totalIuran: number;
}

export interface BpjstkDocData {
  header: BpjstkHeader;
  rows: BpjstkRow[];
  summary: {
    totalTenagaKerja: number;
    totalUpah: number;
    totalRapel: number;
    totalJkk: number;
    totalJkm: number;
    totalJhtPemberiKerja: number;
    totalJhtTenagaKerja: number;
    totalJpPemberiKerja: number;
    totalJpTenagaKerja: number;
    totalJkpPemberiKerja: number;
    totalJkpPemerintah: number;
    totalIuran: number;
  };
  footerDate: string;
}

// Built-in exact sample from PT Ulu Plastik Latersia (Formulir 2a PU BPJS Ketenagakerjaan)
const SAMPLE_BPJSTK_DATA: BpjstkDocData = {
  header: {
    formName: "Formulir 2a PU",
    reportTitle: "RINCIAN IURAN TENAGA KERJA",
    npp: "21111722",
    companyName: "ULU PLASTIK LATERSIA HARIAN LEPAS",
    unitName: "ULU PLASTIK LATERSIA HARIAN LEPAS",
    reportPeriod: "12 2026",
    reportMonth: "12",
    reportYear: "2026",
  },
  rows: [
    { no: 1, nomorReferensi: "21042497822", nik: "3514092006950005", nomorPegawai: "", namaTenagaKerja: "ABDUR ROHMAN", tanggalLahir: "20-06-1995", tglKepesertaan: "01-07-2021", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 2, nomorReferensi: "24123957474", nik: "3514091003940001", nomorPegawai: "", namaTenagaKerja: "ASKUR", tanggalLahir: "10-03-1994", tglKepesertaan: "01-09-2024", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 3, nomorReferensi: "21042497756", nik: "3514100208910003", nomorPegawai: "", namaTenagaKerja: "BADRUS SHOLEH", tanggalLahir: "02-08-1991", tglKepesertaan: "01-07-2021", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 4, nomorReferensi: "", nik: "3514090608970005", nomorPegawai: "", namaTenagaKerja: "BASKARA PUTRA MAHARDIKA", tanggalLahir: "06-08-1997", tglKepesertaan: "", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 5, nomorReferensi: "", nik: "3507242511910001", nomorPegawai: "", namaTenagaKerja: "BUAMIN", tanggalLahir: "25-11-1991", tglKepesertaan: "", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 6, nomorReferensi: "25148108100", nik: "3514071608040004", nomorPegawai: "3", namaTenagaKerja: "BURHANUDDIN", tanggalLahir: "16-08-2004", tglKepesertaan: "01-11-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 7, nomorReferensi: "", nik: "3515135811970003", nomorPegawai: "", namaTenagaKerja: "DIAZ SOFIA FAJR", tanggalLahir: "18-11-1997", tglKepesertaan: "", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 8, nomorReferensi: "25148108167", nik: "3514080701060001", nomorPegawai: "8", namaTenagaKerja: "DIDIT ADIT PRATAMA", tanggalLahir: "07-01-2006", tglKepesertaan: "01-11-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 9, nomorReferensi: "25148108225", nik: "3514095902050002", nomorPegawai: "14", namaTenagaKerja: "FEBY TRI WIDIYANINGSIH", tanggalLahir: "19-02-2005", tglKepesertaan: "01-11-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 10, nomorReferensi: "25148108142", nik: "3514070507040001", nomorPegawai: "15", namaTenagaKerja: "IKMALUL IKHSAN", tanggalLahir: "29-02-2004", tglKepesertaan: "01-11-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 11, nomorReferensi: "24123957466", nik: "3514090908040002", nomorPegawai: "", namaTenagaKerja: "KARAN TRI SURYA GUSTI RENDY", tanggalLahir: "09-08-2004", tglKepesertaan: "01-09-2024", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 12, nomorReferensi: "", nik: "3514090608910001", nomorPegawai: "", namaTenagaKerja: "LUTFIANTO", tanggalLahir: "06-08-1991", tglKepesertaan: "", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 13, nomorReferensi: "25011473300", nik: "3514114207870004", nomorPegawai: "", namaTenagaKerja: "MARATUS SHOLIHA", tanggalLahir: "02-07-1987", tglKepesertaan: "01-03-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 14, nomorReferensi: "25148108118", nik: "3514072909040001", nomorPegawai: "4", namaTenagaKerja: "MASRUHAN", tanggalLahir: "29-09-2004", tglKepesertaan: "01-11-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 15, nomorReferensi: "25148108175", nik: "3514090211960001", nomorPegawai: "9", namaTenagaKerja: "MOH. SHOLEHUDDIN", tanggalLahir: "02-11-1996", tglKepesertaan: "01-11-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 16, nomorReferensi: "25148108092", nik: "3514091202940001", nomorPegawai: "2", namaTenagaKerja: "MUHAMMAD TOYIB", tanggalLahir: "12-02-1994", tglKepesertaan: "01-11-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 17, nomorReferensi: "25011473250", nik: "3514122809890003", nomorPegawai: "", namaTenagaKerja: "MULYANTO", tanggalLahir: "28-09-1989", tglKepesertaan: "01-03-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 18, nomorReferensi: "24123957458", nik: "3514093012780001", nomorPegawai: "", namaTenagaKerja: "MUSLIMIN", tanggalLahir: "30-12-1978", tglKepesertaan: "01-09-2024", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 19, nomorReferensi: "", nik: "3514090203820008", nomorPegawai: "", namaTenagaKerja: "MUSOWIRIN", tanggalLahir: "02-03-1982", tglKepesertaan: "", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 20, nomorReferensi: "25011473292", nik: "3514080107890001", nomorPegawai: "", namaTenagaKerja: "PURWANTO", tanggalLahir: "01-07-1989", tglKepesertaan: "01-03-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 21, nomorReferensi: "21042497780", nik: "1206140909970001", nomorPegawai: "", namaTenagaKerja: "REIJA AFANDI SEMBIRING", tanggalLahir: "09-09-1997", tglKepesertaan: "01-07-2021", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 22, nomorReferensi: "25011473284", nik: "3514090909840007", nomorPegawai: "", namaTenagaKerja: "RICKY FRANS ALEXANDER", tanggalLahir: "09-09-1984", tglKepesertaan: "01-03-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 23, nomorReferensi: "", nik: "3514095708790006", nomorPegawai: "", namaTenagaKerja: "RUKIYA", tanggalLahir: "20-10-1977", tglKepesertaan: "", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 24, nomorReferensi: "25011473318", nik: "3514090212820005", nomorPegawai: "", namaTenagaKerja: "SAEFUL", tanggalLahir: "02-12-1982", tglKepesertaan: "01-03-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 25, nomorReferensi: "22066441183", nik: "3514091909910001", nomorPegawai: "", namaTenagaKerja: "SAI'IN", tanggalLahir: "19-09-1991", tglKepesertaan: "01-07-2022", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 26, nomorReferensi: "", nik: "3514094101790010", nomorPegawai: "", namaTenagaKerja: "SALAMA", tanggalLahir: "01-01-1979", tglKepesertaan: "", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 27, nomorReferensi: "", nik: "3514097006700014", nomorPegawai: "", namaTenagaKerja: "SAPAAH", tanggalLahir: "30-06-1970", tglKepesertaan: "", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 28, nomorReferensi: "", nik: "3514110609700005", nomorPegawai: "", namaTenagaKerja: "SUDIONO", tanggalLahir: "06-09-1970", tglKepesertaan: "", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 29, nomorReferensi: "21042497749", nik: "3514070101990005", nomorPegawai: "", namaTenagaKerja: "SYAMSUL HADI", tanggalLahir: "01-01-1999", tglKepesertaan: "01-07-2021", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 30, nomorReferensi: "24123957482", nik: "3514082409920002", nomorPegawai: "", namaTenagaKerja: "TOYIB", tanggalLahir: "24-05-1992", tglKepesertaan: "01-09-2024", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 31, nomorReferensi: "25148108159", nik: "3514072008040003", nomorPegawai: "7", namaTenagaKerja: "ULIL MUJAHIDDIN", tanggalLahir: "20-08-2004", tglKepesertaan: "01-11-2025", jumlahUpah: 2140000, jumlahRapel: 0, iuranJkk: 19046, iuranJkm: 6420, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 25466 },
    { no: 32, nomorReferensi: "25011473219", nik: "3514090101750027", nomorPegawai: "", namaTenagaKerja: "UMAR", tanggalLahir: "01-01-1975", tglKepesertaan: "01-03-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
    { no: 33, nomorReferensi: "25148108191", nik: "3514092303990001", nomorPegawai: "11", namaTenagaKerja: "YAHYA RIZAL ARIS", tanggalLahir: "23-03-1999", tglKepesertaan: "01-11-2025", jumlahUpah: 2000000, jumlahRapel: 0, iuranJkk: 17800, iuranJkm: 6000, jhtPemberiKerja: 0, jhtTenagaKerja: 0, jpPemberiKerja: 0, jpTenagaKerja: 0, jkpPemberiKerja: 0, jkpPemerintah: 0, totalIuran: 23800 },
  ],
  summary: {
    totalTenagaKerja: 33,
    totalUpah: 68520000,
    totalRapel: 0,
    totalJkk: 609828,
    totalJkm: 205560,
    totalJhtPemberiKerja: 0,
    totalJhtTenagaKerja: 0,
    totalJpPemberiKerja: 0,
    totalJpTenagaKerja: 0,
    totalJkpPemberiKerja: 0,
    totalJkpPemerintah: 0,
    totalIuran: 815388,
  },
  footerDate: "11 November 2026",
};

/**
 * Format number to Indonesian Currency String e.g. 2,000,000.00 or 17,800.00
 */
function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function parseCurrencyStr(str: string): number {
  if (!str) return 0;
  // Handle 2,000,000.00 or 2000000
  const clean = str.replace(/,/g, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export const BpjstkPdfConverter: React.FC = () => {
  const [data, setData] = useState<BpjstkDocData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "HAS_REF" | "NO_REF">("ALL");
  const [copiedTable, setCopiedTable] = useState<boolean>(false);
  const [csvDelimiter, setCsvDelimiter] = useState<";" | ",">(";"); // Indonesian standard is semicolon

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printTableRef = useRef<HTMLDivElement>(null);

  /**
   * Parse text items extracted from PDF.js
   */
  const processPdfDocument = async (pdfDoc: any, name: string, sizeStr: string) => {
    setIsLoading(true);
    setParsingError(null);
    try {
      const numPages = pdfDoc.numPages;
      setPageCount(numPages);

      let rawRows: BpjstkRow[] = [];
      let detectedNpp = "";
      let detectedCompany = "";
      let detectedUnit = "";
      let detectedPeriod = "";
      let detectedFooterDate = "";

      for (let p = 1; p <= numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        const items = textContent.items as Array<{
          str: string;
          transform: number[];
        }>;

        if (!items || items.length === 0) continue;

        // Group text items by y coordinate within 3.5px tolerance
        const linesMap = new Map<number, Array<{ str: string; x: number }>>();

        for (const item of items) {
          const text = item.str.trim();
          if (!text) continue;

          const y = Math.round(item.transform[5]);
          const x = item.transform[4];

          // Find existing line with roughly the same y
          let matchedKey: number | null = null;
          for (const key of linesMap.keys()) {
            if (Math.abs(key - y) <= 3.5) {
              matchedKey = key;
              break;
            }
          }

          if (matchedKey !== null) {
            linesMap.get(matchedKey)!.push({ str: text, x });
          } else {
            linesMap.set(y, [{ str: text, x }]);
          }
        }

        // Sort lines from top of the page (highest y) to bottom (lowest y)
        const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

        for (const y of sortedY) {
          const lineItems = linesMap.get(y)!.sort((a, b) => a.x - b.x);
          const fullLineText = lineItems.map((li) => li.str).join(" ");

          // Extract header metadata
          if (fullLineText.includes("NPP") || /^\d{8}$/.test(lineItems[0]?.str)) {
            const nppMatch = fullLineText.match(/\b\d{8}\b/);
            if (nppMatch && !detectedNpp) detectedNpp = nppMatch[0];
          }
          if (
            (fullLineText.includes("Nama Perusahaan") || fullLineText.includes("LATERSIA")) &&
            !detectedCompany
          ) {
            const compMatch = fullLineText.match(
              /(?:Nama Perusahaan\s*)?([A-Z\s]{4,}HARIAN\s+LEPAS|[A-Z\s]{4,}LATERSIA[A-Z\s]*)/i
            );
            if (compMatch) detectedCompany = compMatch[1].trim();
          }
          if (
            fullLineText.includes("Nama Unit Kerja") ||
            (fullLineText.includes("HARIAN LEPAS") && !detectedUnit)
          ) {
            detectedUnit = detectedCompany || "ULU PLASTIK LATERSIA HARIAN LEPAS";
          }
          if (fullLineText.includes("Periode Laporan") || /\b(0[1-9]|1[0-2])\s+(20\d\d)\b/.test(fullLineText)) {
            const periodMatch = fullLineText.match(/\b(0[1-9]|1[0-2])\s+(20\d\d)\b/);
            if (periodMatch && !detectedPeriod) {
              detectedPeriod = `${periodMatch[1]} ${periodMatch[2]}`;
            }
          }

          // Check footer date e.g. ", 11 November 2026"
          const dateMatch = fullLineText.match(/\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+20\d\d\b/i);
          if (dateMatch) {
            detectedFooterDate = dateMatch[0];
          }

          // Parse Data Row
          // A row has a 16-digit NIK
          const nikItemIndex = lineItems.findIndex((it) => /^\d{16}$/.test(it.str));
          if (nikItemIndex !== -1) {
            const nik = lineItems[nikItemIndex].str;

            // Items before NIK: No. and optionally Nomor Referensi (11 digits)
            const preItems = lineItems.slice(0, nikItemIndex);
            let rowNo = rawRows.length + 1;
            let noRef = "";

            for (const it of preItems) {
              if (/^\d{1,4}$/.test(it.str)) {
                rowNo = parseInt(it.str, 10);
              } else if (/^\d{11}$/.test(it.str)) {
                noRef = it.str;
              }
            }

            // Items after NIK
            const postItems = lineItems.slice(nikItemIndex + 1);

            // Find dates in postItems (DD-MM-YYYY)
            const dateIndices: number[] = [];
            postItems.forEach((it, idx) => {
              if (/^\d{2}-\d{2}-\d{4}$/.test(it.str)) {
                dateIndices.push(idx);
              }
            });

            if (dateIndices.length >= 1) {
              const firstDateIdx = dateIndices[0];
              const tglLahir = postItems[firstDateIdx].str;
              const tglKep = dateIndices.length >= 2 ? postItems[dateIndices[1]].str : "";

              // Between NIK and first date is employee name (and maybe small employee number)
              const nameTokens: string[] = [];
              let noPeg = "";

              for (let i = 0; i < firstDateIdx; i++) {
                const token = postItems[i].str;
                // If it's a short integer (1-3 digits) right after NIK, could be nomor pegawai
                if (/^\d{1,3}$/.test(token) && i === 0 && nameTokens.length === 0) {
                  noPeg = token;
                } else if (/^\d{1,3}$/.test(token) && i === firstDateIdx - 1) {
                  noPeg = token;
                } else {
                  nameTokens.push(token);
                }
              }

              const empName = nameTokens.join(" ").trim() || "KARYAWAN";

              // Numeric amounts (Upah, Rapel, JKK, JKM, etc.)
              // All items after the last date
              const lastDateIdx = dateIndices[dateIndices.length - 1];
              const amountItems = postItems.slice(lastDateIdx + 1);

              const numbers: number[] = [];
              for (const it of amountItems) {
                // Match currency formats: 2,000,000.00 or 17,800.00 or 0.00
                const matches = it.str.match(/[\d,]+\.\d{2}/g);
                if (matches) {
                  for (const m of matches) {
                    numbers.push(parseCurrencyStr(m));
                  }
                } else if (/^\d+(\.\d{2})?$/.test(it.str)) {
                  numbers.push(parseFloat(it.str));
                }
              }

              const jumlahUpah = numbers[0] || 0;
              const jumlahRapel = numbers[1] || 0;
              const iuranJkk = numbers[2] || 0;
              const iuranJkm = numbers[3] || 0;
              const jhtPemberiKerja = numbers[4] || 0;
              const jhtTenagaKerja = numbers[5] || 0;
              const jpPemberiKerja = numbers[6] || 0;
              const jpTenagaKerja = numbers[7] || 0;
              const jkpPemberiKerja = numbers[8] || 0;
              const jkpPemerintah = numbers[9] || 0;
              const totalIuran = numbers[numbers.length - 1] || iuranJkk + iuranJkm;

              rawRows.push({
                no: rowNo,
                nomorReferensi: noRef,
                nik,
                nomorPegawai: noPeg,
                namaTenagaKerja: empName,
                tanggalLahir: tglLahir,
                tglKepesertaan: tglKep,
                jumlahUpah,
                jumlahRapel,
                iuranJkk,
                iuranJkm,
                jhtPemberiKerja,
                jhtTenagaKerja,
                jpPemberiKerja,
                jpTenagaKerja,
                jkpPemberiKerja,
                jkpPemerintah,
                totalIuran,
              });
            }
          }
        }
      }

      // If parser couldn't find rows or file is an image/scanned PDF, fallback to sample or warning
      if (rawRows.length === 0) {
        setParsingError(
          "Tidak ditemukan teks digital pada file PDF ini. Pastikan file PDF merupakan dokumen digital resmi dari BPJS Ketenagakerjaan (Formulir 2a PU). Anda dapat mengklik tombol 'Muat Contoh Data' di bawah untuk melihat preview format tabel."
        );
        setIsLoading(false);
        return;
      }

      // Re-number rows if needed to guarantee sequential order
      rawRows = rawRows.map((r, idx) => ({ ...r, no: idx + 1 }));

      // Calculate summary totals
      const totalUpah = rawRows.reduce((acc, r) => acc + r.jumlahUpah, 0);
      const totalRapel = rawRows.reduce((acc, r) => acc + r.jumlahRapel, 0);
      const totalJkk = rawRows.reduce((acc, r) => acc + r.iuranJkk, 0);
      const totalJkm = rawRows.reduce((acc, r) => acc + r.iuranJkm, 0);
      const totalJhtPemberiKerja = rawRows.reduce((acc, r) => acc + r.jhtPemberiKerja, 0);
      const totalJhtTenagaKerja = rawRows.reduce((acc, r) => acc + r.jhtTenagaKerja, 0);
      const totalJpPemberiKerja = rawRows.reduce((acc, r) => acc + r.jpPemberiKerja, 0);
      const totalJpTenagaKerja = rawRows.reduce((acc, r) => acc + r.jpTenagaKerja, 0);
      const totalJkpPemberiKerja = rawRows.reduce((acc, r) => acc + r.jkpPemberiKerja, 0);
      const totalJkpPemerintah = rawRows.reduce((acc, r) => acc + r.jkpPemerintah, 0);
      const totalIuran = rawRows.reduce((acc, r) => acc + r.totalIuran, 0);

      const docData: BpjstkDocData = {
        header: {
          formName: "Formulir 2a PU",
          reportTitle: "RINCIAN IURAN TENAGA KERJA",
          npp: detectedNpp || "21111722",
          companyName: detectedCompany || "ULU PLASTIK LATERSIA HARIAN LEPAS",
          unitName: detectedUnit || detectedCompany || "ULU PLASTIK LATERSIA HARIAN LEPAS",
          reportPeriod: detectedPeriod || "12 2026",
          reportMonth: detectedPeriod ? detectedPeriod.split(" ")[0] : "12",
          reportYear: detectedPeriod ? detectedPeriod.split(" ")[1] : "2026",
        },
        rows: rawRows,
        summary: {
          totalTenagaKerja: rawRows.length,
          totalUpah,
          totalRapel,
          totalJkk,
          totalJkm,
          totalJhtPemberiKerja,
          totalJhtTenagaKerja,
          totalJpPemberiKerja,
          totalJpTenagaKerja,
          totalJkpPemberiKerja,
          totalJkpPemerintah,
          totalIuran,
        },
        footerDate: detectedFooterDate || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      };

      setData(docData);
      setFileName(name);
      setFileSize(sizeStr);
    } catch (err: any) {
      console.error("PDF Parsing Error:", err);
      setParsingError(
        `Gagal memproses file PDF: ${err?.message || "Format PDF tidak didukung"}. Pastikan file merupakan PDF resmi Formulir 2a PU BPJS Ketenagakerjaan.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setParsingError("Format file tidak valid. Harap unggah file dokumen PDF (.pdf).");
      return;
    }

    const sizeStr = (file.size / 1024 / 1024).toFixed(2) + " MB";
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdfDoc = await loadingTask.promise;
      await processPdfDocument(pdfDoc, file.name, sizeStr);
    } catch (e: any) {
      console.error("PDF read error:", e);
      setParsingError(`Tidak dapat membaca file PDF: ${e.message || "Pastikan file tidak rusak"}`);
    }
  };

  const handleLoadSample = () => {
    setData(SAMPLE_BPJSTK_DATA);
    setFileName("BPJSTK_Formulir_2a_PU_Ulu_Plastik_Latersia.pdf");
    setFileSize("382 KB");
    setPageCount(2);
    setParsingError(null);
  };

  const handleReset = () => {
    setData(null);
    setFileName("");
    setFileSize("");
    setPageCount(0);
    setParsingError(null);
    setSearchTerm("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filtered rows for live searching in the HTML table
  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.rows.filter((row) => {
      // Status filter (Reference Number)
      if (statusFilter === "HAS_REF" && !row.nomorReferensi) return false;
      if (statusFilter === "NO_REF" && row.nomorReferensi) return false;

      // Search term
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase().trim();
      return (
        row.namaTenagaKerja.toLowerCase().includes(s) ||
        row.nik.includes(s) ||
        (row.nomorReferensi && row.nomorReferensi.includes(s)) ||
        (row.nomorPegawai && row.nomorPegawai.includes(s)) ||
        row.tanggalLahir.includes(s) ||
        row.tglKepesertaan.includes(s)
      );
    });
  }, [data, searchTerm, statusFilter]);

  /**
   * Export to Clean, Professional CSV
   * Uses BOM (\uFEFF) for Microsoft Excel compatibility
   * Formats NIK & Nomor Referensi with quotes/strings so Excel does not mangle 16 digits
   */
  const handleDownloadCsv = () => {
    if (!data) return;

    const d = csvDelimiter;
    const lines: string[] = [];

    // Metadata Header comments
    lines.push(`"BPJS Ketenagakerjaan - Formulir 2a PU - RINCIAN IURAN TENAGA KERJA"`);
    lines.push(`"NPP"${d}"${data.header.npp}"${d}"Nama Perusahaan"${d}"${data.header.companyName}"${d}"Periode Laporan"${d}"${data.header.reportPeriod}"`);
    lines.push(""); // empty row

    // Table Header matching PDF columns
    const headers = [
      "No.",
      "Nomor Referensi",
      "Nomor Induk Kependudukan (NIK)",
      "Nomor Pegawai",
      "Nama Tenaga Kerja",
      "Tanggal Lahir",
      "Tgl Kepesertaan",
      "Jumlah Upah (Rp)",
      "Jumlah Rapel (Rp)",
      "Iuran JKK (Rp)",
      "Iuran JKM (Rp)",
      "JHT Pemberi Kerja (Rp)",
      "JHT Tenaga Kerja (Rp)",
      "JP Pemberi Kerja (Rp)",
      "JP Tenaga Kerja (Rp)",
      "JKP Pemberi Kerja (Rp)",
      "JKP Pemerintah (Rp)",
      "Total Iuran (Rp)",
    ];
    lines.push(headers.map((h) => `"${h}"`).join(d));

    // Data Rows
    for (const row of data.rows) {
      // Wrap NIK and No Referensi as explicit string =\"...\" so Excel won't scientific-format it
      const nikFormatted = `="${row.nik}"`;
      const refFormatted = row.nomorReferensi ? `="${row.nomorReferensi}"` : '""';

      const rowValues = [
        row.no,
        refFormatted,
        nikFormatted,
        row.nomorPegawai ? `"${row.nomorPegawai}"` : '""',
        `"${row.namaTenagaKerja}"`,
        `"${row.tanggalLahir}"`,
        `"${row.tglKepesertaan || "-"}"`,
        row.jumlahUpah,
        row.jumlahRapel,
        row.iuranJkk,
        row.iuranJkm,
        row.jhtPemberiKerja,
        row.jhtTenagaKerja,
        row.jpPemberiKerja,
        row.jpTenagaKerja,
        row.jkpPemberiKerja,
        row.jkpPemerintah,
        row.totalIuran,
      ];
      lines.push(rowValues.join(d));
    }

    // Summary Row (Jumlah Seluruhnya)
    const summaryValues = [
      `"Jumlah Seluruhnya"`,
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      data.summary.totalUpah,
      data.summary.totalRapel,
      data.summary.totalJkk,
      data.summary.totalJkm,
      data.summary.totalJhtPemberiKerja,
      data.summary.totalJhtTenagaKerja,
      data.summary.totalJpPemberiKerja,
      data.summary.totalJpTenagaKerja,
      data.summary.totalJkpPemberiKerja,
      data.summary.totalJkpPemerintah,
      data.summary.totalIuran,
    ];
    lines.push(summaryValues.join(d));

    // Footer
    lines.push("");
    lines.push(`"Tanggal Cetak/Laporan"${d}"${data.footerDate}"${d}"Pimpinan Perusahaan"${d}"PT. ULU PLASTIK LATERSIA"`);

    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cleanPeriod = (data.header.reportPeriod || "Laporan").replace(/\s+/g, "_");
    a.download = `BPJSTK_Formulir_2a_PU_${cleanPeriod}_${data.header.npp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Copy HTML Table to Clipboard (formatted for Excel / Google Sheets)
   */
  const handleCopyTable = async () => {
    if (!printTableRef.current || !data) return;
    try {
      const tableHtml = printTableRef.current.outerHTML;
      const type = "text/html";
      const blob = new Blob([tableHtml], { type });
      const dataItem = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(dataItem);
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2500);
    } catch (e) {
      console.warn("Clipboard API failed, falling back to plain text:", e);
      // Fallback
      handleDownloadCsv();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Styles for A4 Landscape */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 8pt !important;
          }
          body * {
            visibility: hidden !important;
          }
          #bpjstk-print-wrapper,
          #bpjstk-print-wrapper * {
            visibility: visible !important;
          }
          #bpjstk-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* Top Banner / Hero Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Konverter BPJS Ketenagakerjaan (Formulir 2a PU)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                PDF &rarr; HTML &amp; CSV
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Konversi dokumen resmi "Rincian Iuran Tenaga Kerja" menjadi tabel HTML yang rapi, informatif, dan ekspor CSV siap pakai di Microsoft Excel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!data ? (
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-sm"
              title="Muat contoh data PDF PT Ulu Plastik Latersia (33 Karyawan)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muat Contoh Dokumen PDF</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                title="Unggah file PDF lain"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset File</span>
              </button>

              <button
                onClick={handleCopyTable}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm"
                title="Salin tabel berformat ke clipboard (bisa langsung Ctrl+V ke Excel)"
              >
                {copiedTable ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Tabel</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm"
                title="Cetak format A4 Landscape atau simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak / PDF</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition"
                title="Unduh file CSV untuk Microsoft Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Box (When no data loaded) */}
      {!data && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/90 text-center no-print">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-3xl p-10 transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                : "border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50/90"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Pilih atau Tarik File PDF BPJS Ketenagakerjaan ke Sini
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mb-5 leading-relaxed">
              Mendukung file dokumen resmi Formulir 2a PU (Rincian Iuran Tenaga Kerja). Konversi diproses 100% aman di browser tanpa mengirim data ke pihak ketiga.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>{isLoading ? "Memproses PDF..." : "Pilih File PDF (.pdf)"}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Gunakan Data Contoh UPL</span>
              </button>
            </div>

            {isLoading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Mengekstrak baris tabel, NIK, No. Referensi, dan iuran...
              </div>
            )}
          </div>

          {parsingError && (
            <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">{parsingError}</p>
                <p className="text-[11px] text-rose-600/80 mt-1">
                  Tip: Anda dapat mengklik tombol "Gunakan Data Contoh UPL" untuk mencoba seluruh fitur dengan dataset 33 tenaga kerja PT Ulu Plastik Latersia.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area (When PDF is loaded) */}
      {data && (
        <div className="space-y-6">
          {/* File Meta Info Bar */}
          <div className="bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 no-print">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-800">{fileName}</span>
              <span className="text-slate-400">({fileSize} • {pageCount} Halaman)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-semibold">Delimiter CSV:</span>
                <select
                  value={csvDelimiter}
                  onChange={(e) => setCsvDelimiter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none"
                  title="Format titik-koma (;) direkomendasikan untuk Microsoft Excel region Indonesia"
                >
                  <option value=";">Titik Koma (;) - Standar Excel Indo</option>
                  <option value=",">Koma (,) - Standar Internasional</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 no-print">
            {/* 1. Total Tenaga Kerja */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Tenaga Kerja</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {data.summary.totalTenagaKerja}{" "}
                <span className="text-xs font-normal text-slate-400">Orang</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {data.rows.filter((r) => r.nomorReferensi).length} Terdaftar KPJ • {data.rows.filter((r) => !r.nomorReferensi).length} Baru
              </div>
            </div>

            {/* 2. Total Upah Terlapor */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Upah Dilaporkan</span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                Rp {formatCurrency(data.summary.totalUpah)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Dasar Perhitungan Iuran
              </div>
            </div>

            {/* 3. Total Iuran JKK */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Iuran JKK</span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-lg font-extrabold text-indigo-700 font-mono">
                Rp {formatCurrency(data.summary.totalJkk)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Jaminan Kecelakaan Kerja
              </div>
            </div>

            {/* 4. Total Iuran JKM */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Iuran JKM</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-extrabold text-amber-700 font-mono">
                Rp {formatCurrency(data.summary.totalJkm)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Jaminan Kematian
              </div>
            </div>

            {/* 5. Total Seluruh Iuran */}
            <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-200 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Tagihan Iuran</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-extrabold text-emerald-900 font-mono">
                Rp {formatCurrency(data.summary.totalIuran)}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">
                JKK + JKM + JHT + JP + JKP
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama, NIK, No. Referensi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Status KPJ:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "ALL" ? "bg-white text-emerald-700 font-bold shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  Semua ({data.rows.length})
                </button>
                <button
                  onClick={() => setStatusFilter("HAS_REF")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "HAS_REF" ? "bg-white text-emerald-700 font-bold shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  Ada KPJ ({data.rows.filter((r) => r.nomorReferensi).length})
                </button>
                <button
                  onClick={() => setStatusFilter("NO_REF")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "NO_REF" ? "bg-white text-emerald-700 font-bold shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  Baru / Tanpa KPJ ({data.rows.filter((r) => !r.nomorReferensi).length})
                </button>
              </div>
            </div>
          </div>

          {/* THE OFFICIAL HTML TABLE VIEW */}
          <div
            id="bpjstk-print-wrapper"
            ref={printTableRef}
            className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 md:p-8 font-sans overflow-x-auto"
          >
            {/* Header Document matching Formulir 2a PU */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                {/* Logo BPJS Ketenagakerjaan styling */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
                      BPJS
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                        BPJS
                      </div>
                      <div className="text-xs font-bold text-emerald-600 tracking-tight leading-none mt-0.5">
                        Ketenagakerjaan
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title in center */}
                <div className="text-center">
                  <h1 className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-wide m-0">
                    {data.header.reportTitle}
                  </h1>
                </div>

                {/* Form Tag in top right */}
                <div className="border border-slate-900 px-3 py-1 text-right rounded">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    {data.header.formName}
                  </div>
                  <div className="text-[9px] text-slate-600">
                    BPJS Ketenagakerjaan
                  </div>
                </div>
              </div>

              {/* Company & Unit Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-[11px] text-slate-800">
                <div className="flex items-center">
                  <span className="w-36 font-semibold text-slate-600">NPP</span>
                  <span className="font-mono font-bold text-slate-900">: {data.header.npp}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-semibold text-slate-600">Nama Unit Kerja</span>
                  <span className="font-bold text-slate-900">: {data.header.unitName}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-semibold text-slate-600">Nama Perusahaan</span>
                  <span className="font-bold text-slate-900">: {data.header.companyName}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-semibold text-slate-600">Periode Laporan</span>
                  <span className="font-bold text-slate-900">: {data.header.reportPeriod}</span>
                </div>
              </div>
            </div>

            {/* Official Table with double-level headers matching PDF layout */}
            <table className="w-full border-collapse text-[10.5px] border border-slate-300">
              <thead>
                <tr className="bg-emerald-600 text-white font-bold text-center">
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 w-8">
                    No.
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 min-w-[95px]">
                    Nomor Referensi
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 min-w-[130px]">
                    Nomor Induk Kependudukan (NIK)
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-1.5 py-2 w-12">
                    Nomor Pegawai
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2.5 py-2 text-left min-w-[170px]">
                    Nama Tenaga Kerja
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 w-20">
                    Tanggal Lahir
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 w-20">
                    Tgl Kepesertaan
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 min-w-[90px] text-right">
                    Jumlah Upah (Rp.)
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 w-16 text-right">
                    Jumlah Rapel (Rp.)
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 min-w-[80px] text-right">
                    Iuran JKK (Rp.)
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2 min-w-[70px] text-right">
                    Iuran JKM (Rp.)
                  </th>
                  <th colSpan={2} className="border border-slate-300 px-2 py-1">
                    Iuran JHT TK
                  </th>
                  <th colSpan={2} className="border border-slate-300 px-2 py-1">
                    Iuran JP
                  </th>
                  <th colSpan={2} className="border border-slate-300 px-2 py-1">
                    Iuran JKP
                  </th>
                  <th rowSpan={2} className="border border-slate-300 px-2.5 py-2 min-w-[85px] text-right bg-emerald-700">
                    Total Iuran (Rp.)
                  </th>
                </tr>
                <tr className="bg-emerald-700 text-white font-semibold text-[10px] text-center">
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Pemberi Kerja (Rp.)</th>
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Tenaga Kerja (Rp.)</th>
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Pemberi Kerja (Rp.)</th>
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Tenaga Kerja (Rp.)</th>
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Pemberi Kerja (Rp.)</th>
                  <th className="border border-slate-300 px-1.5 py-1 w-16">Pemerintah (Rp.)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr
                    key={row.nik + "-" + row.no}
                    className={`transition-colors hover:bg-emerald-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                    }`}
                  >
                    {/* No */}
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-600 font-medium">
                      {row.no}
                    </td>

                    {/* Nomor Referensi (KPJ) */}
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-[10px] text-slate-800">
                      {row.nomorReferensi ? (
                        <span className="font-semibold">{row.nomorReferensi}</span>
                      ) : (
                        <span className="text-slate-300 font-normal">-</span>
                      )}
                    </td>

                    {/* NIK */}
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900 text-[10.5px]">
                      {row.nik}
                    </td>

                    {/* Nomor Pegawai */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono text-slate-600">
                      {row.nomorPegawai || "-"}
                    </td>

                    {/* Nama Tenaga Kerja */}
                    <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-slate-900 uppercase">
                      {row.namaTenagaKerja}
                    </td>

                    {/* Tanggal Lahir */}
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-700">
                      {row.tanggalLahir}
                    </td>

                    {/* Tgl Kepesertaan */}
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-700">
                      {row.tglKepesertaan || "-"}
                    </td>

                    {/* Jumlah Upah */}
                    <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(row.jumlahUpah)}
                    </td>

                    {/* Jumlah Rapel */}
                    <td className="border border-slate-300 px-2 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jumlahRapel)}
                    </td>

                    {/* Iuran JKK */}
                    <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(row.iuranJkk)}
                    </td>

                    {/* Iuran JKM */}
                    <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(row.iuranJkm)}
                    </td>

                    {/* JHT Pemberi Kerja */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jhtPemberiKerja)}
                    </td>

                    {/* JHT Tenaga Kerja */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jhtTenagaKerja)}
                    </td>

                    {/* JP Pemberi Kerja */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jpPemberiKerja)}
                    </td>

                    {/* JP Tenaga Kerja */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jpTenagaKerja)}
                    </td>

                    {/* JKP Pemberi Kerja */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jkpPemberiKerja)}
                    </td>

                    {/* JKP Pemerintah */}
                    <td className="border border-slate-300 px-1.5 py-1.5 text-right font-mono text-slate-500">
                      {formatCurrency(row.jkpPemerintah)}
                    </td>

                    {/* Total Iuran */}
                    <td className="border border-slate-300 px-2.5 py-1.5 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40">
                      {formatCurrency(row.totalIuran)}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={18} className="text-center py-8 text-xs text-slate-400">
                      Tidak ada data tenaga kerja yang sesuai dengan kata kunci pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Summary Row matching Jumlah Seluruhnya */}
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900">
                  <td colSpan={7} className="border border-slate-300 px-3 py-2.5 text-left text-xs uppercase tracking-wider font-extrabold">
                    Jumlah Seluruhnya ({data.summary.totalTenagaKerja} Tenaga Kerja)
                  </td>
                  <td className="border border-slate-300 px-2 py-2.5 text-right font-mono text-xs">
                    {formatCurrency(data.summary.totalUpah)}
                  </td>
                  <td className="border border-slate-300 px-2 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalRapel)}
                  </td>
                  <td className="border border-slate-300 px-2 py-2.5 text-right font-mono text-xs">
                    {formatCurrency(data.summary.totalJkk)}
                  </td>
                  <td className="border border-slate-300 px-2 py-2.5 text-right font-mono text-xs">
                    {formatCurrency(data.summary.totalJkm)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJhtPemberiKerja)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJhtTenagaKerja)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJpPemberiKerja)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJpTenagaKerja)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJkpPemberiKerja)}
                  </td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(data.summary.totalJkpPemerintah)}
                  </td>
                  <td className="border border-slate-300 px-2.5 py-2.5 text-right font-mono text-xs font-black text-emerald-900 bg-emerald-100/70">
                    {formatCurrency(data.summary.totalIuran)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Official Footer Block matching PDF page 2 */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start gap-6 text-[10.5px] text-slate-700">
              <div className="max-w-xl">
                <div className="font-bold text-slate-800 mb-1">Keterangan:</div>
                <p className="text-[10px] text-slate-500 leading-relaxed m-0">
                  *) Isian formulir ini dapat disampaikan kepada BPJS Ketenagakerjaan dalam bentuk media elektronik (softcopy) ataupun hasil cetakan dari sistem penggajian perusahaan peserta yang bersangkutan, dengan aturan / format yang sesuai dengan ketentuan BPJS Ketenagakerjaan.
                </p>
              </div>

              <div className="text-center sm:text-right min-w-[220px]">
                <div>Pasuruan, {data.footerDate}</div>
                <div className="h-16"></div>
                <div className="font-bold underline text-slate-900">( Nama dan Tanda Tangan Pimpinan Perusahaan )</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Jabatan: Direktur / HR Manager</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
