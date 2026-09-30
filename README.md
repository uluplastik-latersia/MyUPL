# MyUPL - Modern HR Dashboard & Employee Management System (PWA)

Sistem Manajemen Data Karyawan, Onboarding OCR, dan Dashboard Analitik HR Terintegrasi berbasis Progressive Web Application (PWA). Arsitektur serverless edge 100% Free-Tier yang dirancang untuk performa tinggi, responsif di mobile & desktop, serta tanpa dependensi modul Node.js native (`fs`, `child_process`).

---

## 🏗️ Tech Stack & Arsitektur

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Progressive Web Application (PWA) |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Palette Slate & Indigo (`#1E293B` / `#4F46E5`) |
| **Data Visualization** | Recharts | Donut, Horizontal Bar, Stacked Bar & Age Pyramid |
| **Database** | Turso (libSQL Edge SQLite) | Database global berlatensi rendah |
| **ORM** | Drizzle ORM (`@libsql/client/web`) | Driver HTTP Edge-compatible untuk Cloudflare Workers/Pages |
| **Edge Serverless** | Cloudflare Pages Functions | V8 Edge Runtime (`functions/api/*`) |
| **Smart OCR Engine** | Google Gemini 1.5 Flash | Structured JSON Output mode via Google AI Studio |
| **PWA Scanner** | HTML5 Canvas + WebRTC Video | Auto-crop, rasio KTP, kompresi kanvas < 600 KB |

---

## 🔑 1. PANDUAN SETUP GOOGLE GEMINI FLASH API (100% FREE)

1. Kunjungi **[Google AI Studio](https://aistudio.google.com/)**.
2. Masuk menggunakan akun Google Anda.
3. Klik tombol **"Get API key"** di sidebar kiri.
4. Klik **"Create API key in new project"** (atau pilih project Google Cloud yang sudah ada).
5. Salin API key yang dihasilkan (`AIzaSy...`).
6. Kuota gratis Gemini 1.5 Flash: **15 RPM (Requests Per Minute), 1.500 RPD (Requests Per Day)** — sangat cukup untuk operasional HR onboarding harian.

---

## 🗄️ 2. SETUP TURSO DATABASE (EDGE SQLITE)

1. Pasang Turso CLI di komputer Anda (atau daftar via [turso.tech](https://turso.tech)):
   ```bash
   # Windows (PowerShell)
   irm https://get.turso.tech/win | iex
   ```
2. Login dan buat database baru:
   ```bash
   turso auth login
   turso db create myupl-db
   ```
3. Dapatkan Database URL:
   ```bash
   turso db show myupl-db --url
   # Contoh output: libsql://myupl-db-[nama-org].turso.io
   ```
4. Buat Token Autentikasi:
   ```bash
   turso db tokens create myupl-db
   # Menghasilkan JWT token
   ```

---

## ⚙️ 3. KONFIGURASI ENVIRONMENT VARIABLES

Buat berkas `.env.local` di root proyek:

```env
# Google AI Studio Gemini API Key
GEMINI_API_KEY=AIzaSy...

# Turso Database
TURSO_DATABASE_URL=libsql://myupl-db-[org].turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
```

---

## 🚀 4. MIGRASI DATABASE (DRIZZLE ORM)

Skema database telah dibuat di [`src/db/schema.ts`](file:///c:/Users/INTEL/Documents/APLIKASI%20UPL/database-karyawan/src/db/schema.ts). Jalankan migrasi ke Turso:

```bash
# Generate file migrasi SQL
npm run db:generate

# Terapkan migrasi ke database Turso secara langsung
npm run db:push
```

---

## 💻 5. CARA MENJALANKAN DI LOCAL DEVELOPMENT

### Opsi A: Vite Frontend Dev Server
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

### Opsi B: Fullstack Cloudflare Pages Local Emulator (Wrangler)
Untuk menguji Cloudflare Pages Functions (`functions/api/*`) secara lokal bersama V8 Edge Runtime:
```bash
npm run build
npx wrangler pages dev dist --compatibility-flag=nodejs_compat --binding GEMINI_API_KEY="your_gemini_key" TURSO_DATABASE_URL="libsql://myupl-db-org.turso.io" TURSO_AUTH_TOKEN="your_token"
```

---

## ☁️ 6. DEPLOY KE CLOUDFLARE PAGES (PRODUCTION)

### Langkah 1: Hubungkan Git atau Deploy via Wrangler CLI
Anda dapat langsung mendeploy folder `dist` dan `functions` menggunakan Wrangler CLI:

```bash
# 1. Login Cloudflare
npx wrangler login

# 2. Build aplikasi produksi
npm run build

# 3. Deploy project Pages
npx wrangler pages deploy dist --project-name=myupl-hr-system
```

### Langkah 2: Atur Environment Variables di Cloudflare Dashboard
1. Buka **Cloudflare Dashboard** ➜ **Workers & Pages**.
2. Pilih project **`myupl-hr-system`**.
3. Navigasi ke **Settings** ➜ **Environment Variables** ➜ **Production**.
4. Tambahkan ketiga variabel rahasia:
   - `GEMINI_API_KEY`: *(Key dari Google AI Studio)*
   - `TURSO_DATABASE_URL`: *(URL dari Turso)*
   - `TURSO_AUTH_TOKEN`: *(Token dari Turso)*
5. Simpan dan lakukan redeploy.

---

## 📱 7. FITUR UTAMA & CARA KERJA

### 1. Executive HR Dashboard
- **Metrik Utama**: Total Karyawan Aktif, Rekrutmen Baru ({new Date().getFullYear()}), Rasio Turnover, dan Kontrak PKWT Segera Berakhir.
- **Peringatan Kontrak PKWT**: Widget interaktif memantau kontrak PKWT yang akan kedaluwarsa dalam <30 hari (Kritis - Merah) dan 30-60 hari (Waspada - Kuning).
- **Grafik Analitik**:
  - *Distribusi Gender*: Donut chart komposisi tenaga kerja.
  - *Piramida Usia*: Histogram kelompok umur (<25, 25-34, 35-44, 45-54, 55+).
  - *Masa Kerja (Tenure)*: Sebaran loyalitas (<1 thn, 1-3 thn, 3-5 thn, >5 thn).
  - *Sebaran Departemen*: Horizontal bar per divisi kerja.
  - *Status Kerja*: Komposisi PKWTT, PKWT, Harian Lepas, dan Magang.
- **Filter Global**: Saring seluruh analitik berdasarkan departemen dan status kerja secara instan.

### 2. Smart OCR Onboarding (Kamera & AI)
1. Buka tab **"OCR Scanner"** atau klik **"Buka Kamera Pindai KTP"**.
2. Kamera akan memuat bingkai panduan e-KTP Indonesia (Rasio 1.586).
3. Saat foto diambil:
   - Kanvas HTML5 secara otomatis memotong, mereduksi ke dimensi optimal (maks 1280x720), dan mengompresi gambar JPEG di bawah 600 KB.
4. Gambar dikirim ke edge endpoint `/api/ocr` yang mengeksekusi Google Gemini 1.5 Flash dalam mode **Structured JSON Output**.
5. Sistem menyajikan antarmuka **Human-in-the-Loop Side-by-Side Review**:
   - Sebelah kiri menampilkan foto fisik KTP hasil bidikan.
   - Sebelah kanan menampilkan kolom-kolom data hasil ekstraksi AI yang dapat diedit langsung.
6. Validasi skema Zod dijalankan sebelum data dikirim dan disimpan ke tabel SQLite Turso.

### 3. Direktori Karyawan & Master Data
- Pencarian multi-kolom (Nama, NIK, Jabatan).
- Filter berdasarkan divisi, status kontrak, dan masa kerja.
- Pengurutan tabel interaktif (Sort by NIK, Nama, Status).
- Paginasi data dinamis.
- Ekspor data lengkap ke format **CSV / Excel** dengan 1 klik.
- Modal detail karyawan lengkap dengan pratinjau dokumen scan fisik KTP.
