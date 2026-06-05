<div align="center">

<img src="static/favicon.png" alt="Digimos Logo" width="80" />

# 🕌 Digimos

**Sistem Informasi Display Masjid — Berbasis Web, Gratis, Open Source**

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> Tampilkan jadwal sholat, countdown adzan & iqamah, teks berjalan, dan streaming YouTube —  
> langsung di TV atau layar masjid Anda. Gratis selamanya.

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|-----------|
| 🕐 **Jadwal Sholat Otomatis** | Sinkronisasi dari MyQuran API & AlAdhan API |
| 📺 **6 Tema Tampilan** | Pilih tema yang sesuai estetika masjid |
| 🔔 **Adzan & Iqamah Countdown** | Overlay otomatis saat waktu sholat tiba |
| 📢 **Running Text** | Pengumuman berjalan yang bisa dikonfigurasi |
| 🖼️ **Manajemen Wallpaper** | Upload & pilih gambar latar tampilan |
| 📡 **Mode YouTube** | Putar streaming YouTube sebagai latar belakang |
| 🏘️ **Multi-Masjid** | Satu server untuk banyak masjid |
| 🔐 **Panel Admin** | Login aman dengan manajemen pengguna |

---

## 🖥️ Tampilan

> Buka URL display di browser TV atau set-top box — tanpa login.

```
http://alamat-server/display/{masjidId}
```

Contoh: `http://192.168.1.10:3000/display/1`

---

## 🚀 Memulai

### Prasyarat

- **Node.js** versi 20 atau lebih baru
- **npm**

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/wirawibowo/digimos.git
cd digimos

# 2. Install dependensi
npm install

# 3. Konfigurasi environment
cp .env.example .env
```

Edit file `.env`:

```env
DATABASE_PATH=./database.db
SEED_PASSWORD=password_admin_anda
NODE_ENV=development
```

### Setup Database

```bash
# Buat skema database SQLite
npm run db:push

# Isi data awal (superadmin + contoh masjid)
npm run db:seed
```

Setelah seed selesai, login dengan:
- **Username:** `admin`
- **Password:** nilai `SEED_PASSWORD` yang Anda set
- **Contoh masjid:** Masjid Al-Fahrudin (bisa diubah di panel admin)

### Jalankan Mode Development

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

---

## 📦 Build Produksi

```bash
# Build aplikasi
npm run build

# Jalankan server produksi
node build/index.js
```

Server berjalan di port `3000` secara default.  
Gunakan reverse proxy seperti **nginx** atau **Caddy** untuk HTTPS.

---

## 🗂️ Struktur Proyek

```
src/
├── routes/
│   ├── (app)/                    # Panel Admin (perlu login)
│   │   ├── dashboard/
│   │   ├── admin/[masjidId]/
│   │   ├── settings/[masjidId]/
│   │   ├── jadwal/[masjidId]/
│   │   ├── iqamah/[masjidId]/
│   │   └── users/
│   ├── (auth)/login/             # Halaman login
│   ├── display/[masjidId]/       # Tampilan TV (publik)
│   └── api/                      # REST API endpoints
└── lib/
    ├── server/
    │   ├── db.ts                 # Koneksi Drizzle + SQLite
    │   ├── schema.ts             # Skema database
    │   ├── auth.ts               # Manajemen sesi
    │   └── prayer-api.ts         # Integrasi API jadwal sholat
    └── components/
        └── themes/               # Komponen tema tampilan (Theme1–Theme6)
static/
└── uploads/                      # Wallpaper yang diupload pengguna
```

---

## 🌐 API Jadwal Sholat

Digimos mendukung dua penyedia jadwal sholat, bisa dipilih per masjid:

| Penyedia | Keunggulan |
|----------|-----------|
| **MyQuran** *(default)* | Data Kemenag RI, cocok untuk Indonesia |
| **AlAdhan** | Mendukung berbagai metode perhitungan global |

Jadwal di-cache lokal di database setiap bulan — tidak perlu internet setelah sinkronisasi.

---

## ⚙️ Environment Variables

| Variabel | Default | Keterangan |
|----------|---------|-----------|
| `NODE_ENV` | `development` | Set ke `production` di server |
| `DATABASE_PATH` | `./database.db` | Lokasi file database SQLite |
| `SEED_PASSWORD` | *(wajib diisi)* | Password superadmin saat seeding |

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|----------|
| Framework | SvelteKit 2 (adapter-node) |
| Runtime | Node.js 20+ |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Autentikasi | Cookie session + bcryptjs |
| Styling | Plain CSS |

---

## 📱 Versi SPA (Tanpa Server)

Untuk yang ingin tampilan masjid **tanpa perlu server Node.js**, tersedia versi SPA di folder [`SPA/`](./SPA).

| Fitur | Digimos (Full) | Digimos SPA |
|-------|---------------|-------------|
| Jadwal Sholat | ✅ | ✅ |
| Countdown Adzan | ✅ | ✅ |
| Running Text | ✅ | ✅ |
| Admin Panel | ✅ | ❌ |
| Multi-Masjid | ✅ | ❌ |
| Upload Wallpaper | ✅ | ❌ |
| Butuh Server | ✅ Node.js | ❌ Static hosting |

**Cara pakai SPA:**

```bash
cd SPA
npm install
npm run dev       # development
npm run build     # build ke /build — deploy ke GitHub Pages / Netlify / Cloudflare Pages
```

---

## 🤝 Berkontribusi

Kontribusi sangat disambut! Silakan buka [issue](../../issues) atau kirim Pull Request.

1. Fork repositori ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buka Pull Request

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan lebih lengkap.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).  
Bebas digunakan, dimodifikasi, dan didistribusikan — termasuk untuk penggunaan komersial.

---

<div align="center">

Dibuat dengan ❤️ untuk masjid-masjid di seluruh Indonesia

**⭐ Jika proyek ini membantu, beri bintang di GitHub!**

</div>
