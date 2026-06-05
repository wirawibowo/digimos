# Digimos v4 — Bangun Ulang dengan SvelteKit

Membangun ulang sistem display masjid Digimos dari mockup HTML statis menjadi full-stack application menggunakan **SvelteKit + SQLite + Drizzle ORM**.

## Background

### Sistem Lama (v3)
- Berjalan di `http://your-server-ip:8005/v3/display/` — backend tidak diketahui
- Bootstrap + jQuery, overlay fullscreen (adzan, sholat, iqomah, khutbah, syuruq)
- Carousel wallpaper, running text, jadwal sholat sidebar

### Mockup Baru (sudah ada)
5 halaman HTML statis di `d:\digimos\mockup\digimos\`:

| Halaman | File | Fungsi |
|---------|------|--------|
| Home / Dashboard | [index.html](file:///d:/digimos/mockup/digimos/index.html) | Landing page dengan preview display |
| Admin Panel | [admin.html](file:///d:/digimos/mockup/digimos/admin.html) | CRUD jadwal, running text, identitas masjid, config API |
| Pengaturan Tema | [settings.html](file:///d:/digimos/mockup/digimos/settings.html) | 6 layout tema, warna aksen, font, toggle fitur |
| Jadwal Bulanan | [jadwal.html](file:///d:/digimos/mockup/digimos/jadwal.html) | Tabel jadwal sebulan, navigasi bulan |
| Display TV | [display.html](file:///d:/digimos/mockup/digimos/display.html) | Fullscreen untuk STB: jam, jadwal, countdown, adzan, iqamah |

### Aset
- 5 gambar di `assets/`: `masjid-bg.png` (1.8 MB), `masjid-1/2/3.webp`, `masjid-bg.webp`

### Environment
- **Node.js**: v24.14.1
- **Target deploy**: Server dengan IP publik
- **Client display**: STB bekas dengan browser Chromium embedded

---

## Keputusan Desain (Sudah Disetujui)

| Keputusan | Jawaban |
|-----------|---------|
| Single / Multi masjid | **Multi-masjid** — 1 server bisa kelola banyak masjid |
| Audio adzan / buzzer | **Phase 2** — nanti ditambahkan |
| Upload wallpaper | **Ya** — admin bisa upload gambar sendiri |
| Export PDF jadwal | **Phase 2** |
| YouTube streaming | **Ya** — display bisa pilih tampilkan wallpaper ATAU streaming YouTube |
| Tweaks panel React | **Dihilangkan** — semua setting via admin panel |

---

## Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | SvelteKit 2 | Full-stack, SSR, bundle terkecil untuk STB |
| **Runtime** | Node.js 24 | Sudah terinstall |
| **Database** | SQLite via better-sqlite3 | Zero config, 1 file, ringan |
| **ORM** | Drizzle ORM | Type-safe, ringan, native SQLite support |
| **Auth** | Cookie session + bcrypt | Simple |
| **API Jadwal** | MyQuran API v2 + AlAdhan (fallback) | Data Kemenag, gratis |
| **Styling** | CSS murni (migrasi dari mockup) | Konsisten desain, zero overhead |
| **File Upload** | Multer / formidable | Upload wallpaper |

---

## Proposed Changes

### Arsitektur

```
d:\digimos\
├── mockup/                       ← referensi (tidak diubah)
├── src/
│   ├── routes/
│   │   ├── (app)/                ← layout admin (perlu login)
│   │   │   ├── +layout.svelte
│   │   │   ├── +layout.server.ts
│   │   │   ├── dashboard/        ← home/overview
│   │   │   ├── admin/
│   │   │   │   └── [masjidId]/   ← kelola per masjid
│   │   │   ├── masjid/           ← daftar & tambah masjid
│   │   │   ├── settings/
│   │   │   │   └── [masjidId]/   ← tema per masjid
│   │   │   ├── jadwal/
│   │   │   │   └── [masjidId]/   ← jadwal bulanan per masjid
│   │   │   └── users/            ← kelola user (admin only)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── display/
│   │   │   └── [id]/             ← fullscreen display per masjid
│   │   └── api/
│   │       ├── jadwal/
│   │       ├── settings/
│   │       ├── upload/           ← upload wallpaper
│   │       └── auth/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db.ts
│   │   │   ├── schema.ts
│   │   │   ├── seed.ts
│   │   │   ├── prayer-api.ts
│   │   │   └── auth.ts
│   │   ├── components/
│   │   └── stores/
│   └── app.html
├── static/
│   └── assets/
├── uploads/                      ← wallpaper upload destination
├── drizzle/
├── database.db
├── package.json
├── svelte.config.js
└── drizzle.config.ts
```

---

### 1. Project Setup & Configuration

#### [NEW] package.json
```
Dependencies:
  @sveltejs/kit, svelte, @sveltejs/adapter-node
  drizzle-orm, better-sqlite3
  bcryptjs (pure JS, no native build needed)

DevDependencies:
  drizzle-kit, @types/better-sqlite3
  typescript, vite
```

#### [NEW] svelte.config.js
- Adapter: `@sveltejs/adapter-node`

#### [NEW] vite.config.ts, drizzle.config.ts, tsconfig.json
Standard configs

---

### 2. Database Schema

#### [NEW] src/lib/server/schema.ts

```
users
  ├── id            INTEGER PK
  ├── username       TEXT UNIQUE
  ├── password       TEXT (bcrypt)
  ├── name           TEXT
  ├── role           TEXT (superadmin | admin | operator)
  ├── masjid_id      INTEGER NULL (operator terikat ke 1 masjid)
  ├── created_at     TEXT
  └── updated_at     TEXT

masjids
  ├── id            INTEGER PK
  ├── name           TEXT
  ├── address         TEXT
  ├── phone           TEXT
  ├── city_api_id     TEXT (kode kota MyQuran)
  ├── city_name       TEXT
  ├── api_provider    TEXT DEFAULT 'myquran' (myquran | aladhan | manual)
  ├── api_method      TEXT DEFAULT 'kemenag'
  ├── logo_url        TEXT
  ├── created_at      TEXT
  └── updated_at      TEXT

display_settings
  ├── id            INTEGER PK
  ├── masjid_id      INTEGER FK → masjids
  ├── theme           TEXT DEFAULT 't1'
  ├── accent_color    TEXT DEFAULT '#f0cd86'
  ├── bg_mode         TEXT DEFAULT 'wallpaper' (wallpaper | youtube)
  ├── bg_image        TEXT DEFAULT 'masjid-bg.webp'
  ├── youtube_url     TEXT NULL
  ├── clock_font      TEXT DEFAULT 'Inter'
  ├── marquee_speed   INTEGER DEFAULT 60
  ├── show_frame      BOOLEAN DEFAULT true
  ├── show_logo       BOOLEAN DEFAULT true
  ├── show_hijri      BOOLEAN DEFAULT true
  ├── adzan_auto      BOOLEAN DEFAULT true
  ├── iqamah_auto     BOOLEAN DEFAULT true
  ├── adzan_duration  INTEGER DEFAULT 180 (detik tampil overlay adzan)
  └── updated_at      TEXT

prayer_schedules
  ├── id            INTEGER PK
  ├── masjid_id      INTEGER FK → masjids
  ├── date           TEXT (YYYY-MM-DD)
  ├── shubuh          TEXT (HH:MM)
  ├── syuruq          TEXT
  ├── dzuhur          TEXT
  ├── ashar           TEXT
  ├── maghrib         TEXT
  ├── isya            TEXT
  ├── source          TEXT (api | manual)
  └── UNIQUE(masjid_id, date)

iqamah_settings
  ├── id            INTEGER PK
  ├── masjid_id      INTEGER FK → masjids
  ├── shubuh          INTEGER DEFAULT 10 (menit)
  ├── dzuhur          INTEGER DEFAULT 10
  ├── ashar           INTEGER DEFAULT 10
  ├── maghrib         INTEGER DEFAULT 10
  ├── isya            INTEGER DEFAULT 10
  └── syuruq_range    TEXT DEFAULT '06:10'

announcements
  ├── id            INTEGER PK
  ├── masjid_id      INTEGER FK → masjids
  ├── text           TEXT
  ├── active          BOOLEAN DEFAULT true
  ├── sort_order      INTEGER DEFAULT 0
  ├── created_at      TEXT
  └── updated_at      TEXT

wallpapers
  ├── id            INTEGER PK
  ├── masjid_id      INTEGER FK → masjids
  ├── filename        TEXT
  ├── original_name   TEXT
  ├── size_bytes      INTEGER
  ├── is_default      BOOLEAN DEFAULT false
  └── uploaded_at     TEXT

sessions
  ├── id            TEXT PK (UUID)
  ├── user_id        INTEGER FK → users
  ├── expires_at      TEXT
  └── created_at      TEXT
```

---

### 3. Server Library

#### [NEW] src/lib/server/db.ts
Koneksi SQLite + Drizzle instance. Auto-create DB + run migrations on startup.

#### [NEW] src/lib/server/seed.ts
Data awal:
- User superadmin: `admin` / (set via `SEED_PASSWORD` env var)
- Masjid contoh: "Masjid Nurul Himmah" (Depok)
- Settings default, iqamah offsets default
- 5 pengumuman contoh dari mockup
- Preset wallpapers (dari `static/assets/`)

#### [NEW] src/lib/server/prayer-api.ts
```
Flow:
1. getJadwal(masjidId, date)
   → Cek DB (prayer_schedules WHERE masjid_id AND date)
   → Jika ada → return dari DB
   → Jika tidak ada → fetchFromApi(masjid) → simpan ke DB → return

2. syncMonth(masjidId, year, month)
   → Fetch semua hari dalam 1 bulan sekaligus
   → Bulk insert ke DB
   → Dipakai oleh halaman jadwal bulanan

3. fetchFromMyQuran(cityId, date)
   → GET https://api.myquran.com/v2/sholat/jadwal/{cityId}/{yyyy}/{mm}/{dd}

4. fetchFromAlAdhan(cityName, date)  [fallback]
   → GET https://api.aladhan.com/v1/timingsByCity?city={city}&country=Indonesia&method=20&date={dd-mm-yyyy}
```

#### [NEW] src/lib/server/auth.ts
- `createSession(userId)` → UUID, cookie `digimos_session`
- `validateSession(cookies)` → return user or null
- `hashPassword` / `verifyPassword` — bcryptjs

---

### 4. Halaman & Routing

---

#### Auth

##### [NEW] src/routes/(auth)/login/+page.svelte
Halaman login — navy + gold theme, form username + password, error message.

##### [NEW] src/routes/(auth)/login/+page.server.ts
Form action: validate → create session → redirect `/dashboard`

---

#### Admin Layout (Protected)

##### [NEW] src/routes/(app)/+layout.server.ts
Auth guard: no session → redirect `/login`
Load: current user, daftar masjid (untuk sidebar/dropdown)

##### [NEW] src/routes/(app)/+layout.svelte
Layout: Topbar (brand + nav + masjid selector + user) — migrasi dari mockup

---

#### Dashboard

##### [NEW] src/routes/(app)/dashboard/+page.svelte
Migrasi dari [index.html](file:///d:/digimos/mockup/digimos/index.html):
- Overview semua masjid (card per masjid)
- Quick stats: total masjid, total display, sholat berikutnya
- Link cepat ke admin/settings/display per masjid
- Live clock preview

---

#### Kelola Masjid (multi-masjid)

##### [NEW] src/routes/(app)/masjid/+page.svelte
Daftar masjid — card list, tombol "Tambah Masjid"

##### [NEW] src/routes/(app)/masjid/+page.server.ts
CRUD masjid: list, create

---

#### Admin Per Masjid

##### [NEW] src/routes/(app)/admin/[masjidId]/+page.svelte
Migrasi dari [admin.html](file:///d:/digimos/mockup/digimos/admin.html):
- **Stat cards**: tanggal, sholat berikutnya, jumlah pengumuman, display link
- **Tabel jadwal sholat**: waktu adzan (editable), offset iqamah (editable), toggle notifikasi
- **Config API**: dropdown provider (MyQuran/AlAdhan/Manual), input kota, metode — tombol "Sinkron API"
- **Running text**: textarea tambah, list pengumuman (edit/hapus/reorder)
- **Identitas masjid**: nama, alamat, telepon
- **Save bar**: sticky bottom, indikator unsaved changes

##### [NEW] src/routes/(app)/admin/[masjidId]/+page.server.ts
Actions: load/save jadwal, sync API, CRUD announcements, update masjid identity

---

#### Settings Per Masjid

##### [NEW] src/routes/(app)/settings/[masjidId]/+page.svelte
Migrasi dari [settings.html](file:///d:/digimos/mockup/digimos/settings.html):
- **6 tema layout** (selectable preview cards: t1-t6)
- **Personalisasi**:
  - Warna aksen (5 swatch: gold, blue, green, red, purple)
  - Foto latar / Wallpaper — pilih dari gallery upload ATAU preset
  - **YouTube streaming URL** — input URL, toggle wallpaper/youtube
  - Font jam digital (Inter / DSEG7 / Orbitron)
  - Kecepatan running text (slider)
- **Mode & Notifikasi**:
  - Toggle adzan auto (overlay fullscreen)
  - Toggle iqamah countdown
  - Toggle hijri date
  - Toggle logo masjid
  - Toggle gold frame
- **Gallery Wallpaper**:
  - Grid gambar yang sudah diupload
  - Tombol upload baru
  - Set sebagai aktif
  - Hapus

##### [NEW] src/routes/(app)/settings/[masjidId]/+page.server.ts
Actions: load/save settings, upload wallpaper, delete wallpaper

---

#### Jadwal Bulanan Per Masjid

##### [NEW] src/routes/(app)/jadwal/[masjidId]/+page.svelte
Migrasi dari [jadwal.html](file:///d:/digimos/mockup/digimos/jadwal.html):
- Tabel 31 hari: hari/tanggal + Hijri, shubuh-isya
- Navigasi bulan (prev/next)
- Summary cards: rata-rata waktu, jumlah Jumat, hari Ramadan
- Selector kota
- Highlight hari ini (gold) & Jumat (green)
- Tombol sinkron API

##### [NEW] src/routes/(app)/jadwal/[masjidId]/+page.server.ts
Load: fetch jadwal sebulan dari DB, trigger API sync jika belum ada

---

#### Kelola User (superadmin only)

##### [NEW] src/routes/(app)/users/+page.svelte
Tabel user: username, nama, role, masjid — tambah/edit/hapus
(Desain konsisten dengan admin panel)

---

#### Display TV (Fullscreen, No Auth)

##### [NEW] src/routes/display/[id]/+page.svelte
Migrasi dari [display.html](file:///d:/digimos/mockup/digimos/display.html):

**Layout utama** (grid: sidebar 30vw + right area + marquee bottom):

- **Gold frame**: ornamental gradient border (optional via settings)
- **Sidebar kiri**: 6 jadwal sholat (Shubuh–Isya) dengan:
  - Icon SVG per waktu
  - Nama sholat + waktu adzan
  - Waktu iqamah
  - Highlight aktif (gold glow, yellow time)
  - Islamic pattern background
- **Area kanan**:
  - **Background**: wallpaper ATAU YouTube iframe embed (pilih dari settings)
  - **Header**: logo + nama masjid + alamat | tanggal pill (Masehi + Hijri)
  - **Jam digital besar**: HH:MM:SS (font Inter 800, blinking separator)
  - **Clock sub**: "Menuju waktu [nama]" + tanggal Hijri
  - **Countdown bubble**: pill pojok kanan bawah (icon + nama sholat + -HH:MM:SS)
- **Marquee bawah**: running text seamless loop, kecepatan configurable
- **Overlay Adzan** (z-index 100, fullscreen):
  - Label "WAKTU SHOLAT TELAH MASUK"
  - Arabic: حَيَّ عَلَى الصَّلَاة
  - Nama sholat (gradient text, 140px)
  - Nama masjid
  - Jam besar
  - Pulse dot "Hentikan aktivitas dan segera tunaikan sholat"
  - Auto-trigger saat waktu adzan, auto-dismiss setelah N detik (configurable)
- **Overlay Iqamah** (z-index 100, fullscreen):
  - Label "IQAMAH DALAM"
  - Countdown besar MM:SS (380px font)
  - "Persiapkan diri untuk sholat [nama] berjamaah"
  - Auto-trigger setelah overlay adzan selesai
  - Auto-dismiss saat countdown habis

**JavaScript logic** (client-side, setiap 1 detik):
1. `tick()` — update jam, tanggal
2. `updateNext()` — hitung sholat berikutnya, highlight aktif, update countdown
3. `checkAdzan()` — jika waktu === adzan → show overlay adzan
4. `checkIqamah()` — setelah adzan → mulai countdown iqamah
5. Polling `/api/jadwal?masjid_id=X` setiap 5 menit — refresh jadwal dari server

**YouTube mode**:
- Jika `bg_mode === 'youtube'` → tampilkan `<iframe>` YouTube embed menggantikan wallpaper
- URL di-convert ke embed format: `youtube.com/watch?v=xxx` → `youtube.com/embed/xxx?autoplay=1&mute=1`
- Jika stream tidak tersedia → fallback ke wallpaper

##### [NEW] src/routes/display/[id]/+page.server.ts
SSR load: masjid data, jadwal hari ini, settings, announcements, iqamah offsets

---

### 5. API Routes

##### [NEW] src/routes/api/jadwal/+server.ts
- `GET ?masjid_id=1&date=YYYY-MM-DD` → jadwal hari itu
- `GET ?masjid_id=1&month=6&year=2026` → jadwal sebulan

##### [NEW] src/routes/api/jadwal/sync/+server.ts
- `POST {masjid_id, month, year}` → fetch dari API → simpan DB → return

##### [NEW] src/routes/api/settings/+server.ts
- `GET ?masjid_id=1` → display settings + iqamah offsets
- `PUT {masjid_id, ...settings}` → update

##### [NEW] src/routes/api/upload/+server.ts
- `POST` (multipart form) → save ke `uploads/{masjid_id}/` → insert wallpapers table → return filename

##### [NEW] src/routes/api/auth/+server.ts
- `POST /login` → validate → session
- `POST /logout` → destroy session

---

### 6. Komponen Svelte Reusable

| Komponen | Deskripsi |
|----------|-----------|
| `Topbar.svelte` | Brand logo + nav + masjid dropdown + user badge |
| `PrayerRow.svelte` | Baris jadwal (icon + nama + waktu + iqamah) |
| `StatCard.svelte` | Card statistik (label + value + delta) |
| `ThemeCard.svelte` | Preview tema thumbnail + meta + selected |
| `AnnouncementItem.svelte` | Item pengumuman + edit/hapus |
| `Toggle.svelte` | Custom toggle switch |
| `TimeField.svelte` | Input waktu styled |
| `WallpaperGrid.svelte` | Grid gambar upload + selector |
| `MasjidCard.svelte` | Card masjid di dashboard |
| `SaveBar.svelte` | Sticky bottom bar "unsaved changes" |

---

### 7. Static Assets & Uploads

```bash
# Copy preset wallpapers
mockup/digimos/assets/ → static/assets/

# Upload directory (runtime, gitignored)
uploads/
  └── {masjid_id}/
      ├── wallpaper-1.webp
      └── wallpaper-2.jpg
```

---

### 8. CSS Design System

#### [NEW] src/app.css
Extracted dari semua mockup:
- CSS custom properties: `--navy-*`, `--gold-*`, `--border`, `--panel`, `--muted`
- Typography: Plus Jakarta Sans (UI), Inter (angka/jam), Amiri (Arabic)
- Base: reset, body, scrollbar
- Components: `.btn`, `.card`, `.input`, `.textarea`, `.toggle`, `.topbar`
- Display: `.prayer`, `.clock-time`, `.overlay`, `.marquee`, `.gold-frame`
- Animations: `@keyframes blink`, `scroll`, `pulse`

---

## Urutan Pengerjaan (Phase 1)

| Step | Task | Estimasi |
|------|------|----------|
| 1 | Project setup (SvelteKit + deps + config) | 10 min |
| 2 | Database schema + migrations + seed | 15 min |
| 3 | Auth (login/logout/session guard) | 15 min |
| 4 | CSS design system + shared components | 20 min |
| 5 | Admin layout + dashboard | 15 min |
| 6 | Masjid CRUD (multi-masjid) | 15 min |
| 7 | Admin panel per masjid (jadwal + announcements) | 30 min |
| 8 | Settings per masjid (tema + wallpaper + YouTube) | 25 min |
| 9 | Wallpaper upload | 15 min |
| 10 | Prayer API integration (MyQuran + cache) | 20 min |
| 11 | Jadwal bulanan | 15 min |
| 12 | **Display TV** (fullscreen, clock, countdown, overlays) | 30 min |
| 13 | YouTube embed di display | 10 min |
| 14 | User management (superadmin) | 15 min |
| 15 | Testing & polish | 20 min |

---

## Phase 2 (Nanti)

- 🔊 Audio adzan / buzzer sound saat masuk waktu
- 📄 Export PDF jadwal bulanan
- 🖨️ Cetak jadwal
- 📱 Responsive admin (mobile friendly)
- 🔔 Push notification ke HP admin
- 📊 Analytics (berapa kali display aktif)

---

## Verification Plan

### Build & Run
```bash
npm install
npm run db:push          # create tables
npm run db:seed          # insert default data
npm run dev              # start dev server
npm run build            # production build
node build/index.js      # production run
```

### Manual Testing Checklist
1. ✅ Login → redirect dashboard
2. ✅ Dashboard → list masjid, quick stats
3. ✅ Tambah masjid baru → muncul di list
4. ✅ Admin panel → edit jadwal, save → data di DB berubah
5. ✅ Sinkron API → jadwal ter-update dari MyQuran
6. ✅ Running text → tambah/edit/hapus → muncul di display
7. ✅ Settings → pilih tema, ganti warna → display berubah
8. ✅ Upload wallpaper → muncul di gallery → bisa set sebagai aktif
9. ✅ YouTube URL → display switch ke iframe streaming
10. ✅ Jadwal bulanan → 31 hari, highlight hari ini
11. ✅ Display `/display/1` → jam jalan, countdown benar
12. ✅ Overlay adzan auto-trigger saat waktu sholat
13. ✅ Overlay iqamah countdown berjalan
14. ✅ STB browser → performa lancar

### Performance Target (STB)
- Display page load < 3 detik
- RAM browser < 100 MB
- CPU idle < 10%
- Bundle JS display < 50 KB
