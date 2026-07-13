#!/usr/bin/env node
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const dbPath = getArg('--db-path') || './database.db';
const password = getArg('--password');
const masjidName = getArg('--masjid-name') || 'Masjid';

if (!password) {
  console.error('ERROR: --password wajib diisi');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS masjids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    city_api_id TEXT NOT NULL,
    city_name TEXT NOT NULL,
    api_provider TEXT NOT NULL DEFAULT 'myquran',
    api_method TEXT NOT NULL DEFAULT 'kemenag',
    logo_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
    masjid_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS display_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    masjid_id INTEGER NOT NULL REFERENCES masjids(id),
    theme TEXT NOT NULL DEFAULT 't1',
    accent_color TEXT NOT NULL DEFAULT '#f0cd86',
    bg_mode TEXT NOT NULL DEFAULT 'wallpaper',
    bg_image TEXT NOT NULL DEFAULT 'masjid-bg.webp',
    youtube_url TEXT,
    clock_font TEXT NOT NULL DEFAULT 'Inter',
    marquee_speed INTEGER NOT NULL DEFAULT 60,
    show_frame INTEGER NOT NULL DEFAULT 1,
    show_logo INTEGER NOT NULL DEFAULT 1,
    show_hijri INTEGER NOT NULL DEFAULT 1,
    adzan_auto INTEGER NOT NULL DEFAULT 1,
    iqamah_auto INTEGER NOT NULL DEFAULT 1,
    adzan_duration INTEGER NOT NULL DEFAULT 180,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prayer_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    masjid_id INTEGER NOT NULL REFERENCES masjids(id),
    date TEXT NOT NULL,
    shubuh TEXT NOT NULL,
    syuruq TEXT NOT NULL,
    dzuhur TEXT NOT NULL,
    ashar TEXT NOT NULL,
    maghrib TEXT NOT NULL,
    isya TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'api',
    UNIQUE(masjid_id, date)
  );

  CREATE TABLE IF NOT EXISTS iqamah_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    masjid_id INTEGER NOT NULL REFERENCES masjids(id),
    shubuh INTEGER NOT NULL DEFAULT 10,
    dzuhur INTEGER NOT NULL DEFAULT 10,
    ashar INTEGER NOT NULL DEFAULT 10,
    maghrib INTEGER NOT NULL DEFAULT 10,
    isya INTEGER NOT NULL DEFAULT 10,
    syuruq_range TEXT NOT NULL DEFAULT '06:10'
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    masjid_id INTEGER NOT NULL REFERENCES masjids(id),
    text TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallpapers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    masjid_id INTEGER NOT NULL REFERENCES masjids(id),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    uploaded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync(password, 10);

const insertMasjid = db.prepare(`
  INSERT INTO masjids (name, address, phone, city_api_id, city_name, api_provider, api_method, logo_url, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
`);
const masjid = insertMasjid.run(masjidName, '-', '-', '0314', 'Depok', 'myquran', 'kemenag', now, now);
const masjidId = masjid.lastInsertRowid;

db.prepare(`
  INSERT INTO users (username, password, name, role, masjid_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, NULL, ?, ?)
`).run('admin', passwordHash, 'Super Admin', 'superadmin', now, now);

db.prepare(`
  INSERT INTO display_settings (masjid_id, theme, accent_color, bg_mode, bg_image, youtube_url, clock_font, marquee_speed, show_frame, show_logo, show_hijri, adzan_auto, iqamah_auto, adzan_duration, updated_at)
  VALUES (?, 't1', '#f0cd86', 'wallpaper', 'masjid-bg.webp', NULL, 'Inter', 60, 1, 1, 1, 1, 1, 180, ?)
`).run(masjidId, now);

db.prepare(`
  INSERT INTO iqamah_settings (masjid_id, shubuh, dzuhur, ashar, maghrib, isya, syuruq_range)
  VALUES (?, 10, 10, 10, 10, 10, '06:10')
`).run(masjidId);

const insertAnnouncement = db.prepare(`
  INSERT INTO announcements (masjid_id, text, active, sort_order, created_at, updated_at)
  VALUES (?, ?, 1, ?, ?, ?)
`);
const announcementTexts = [
  'Selamat datang di ' + masjidName,
  'Mohon matikan atau senyapkan ponsel selama sholat',
  'Kajian rutin setiap Jumat malam',
  'Infaq dan sedekah dapat disalurkan melalui kotak amal',
  'Mari jaga kebersihan dan ketertiban masjid'
];
for (let i = 0; i < announcementTexts.length; i++) {
  insertAnnouncement.run(masjidId, announcementTexts[i], i, now, now);
}

const insertWallpaper = db.prepare(`
  INSERT INTO wallpapers (masjid_id, filename, original_name, size_bytes, is_default, uploaded_at)
  VALUES (?, ?, ?, 0, ?, ?)
`);
const wallpaperFiles = [
  { name: 'masjid-bg.webp', isDefault: 1 },
  { name: 'masjid-1.webp', isDefault: 0 },
  { name: 'masjid-2.webp', isDefault: 0 },
  { name: 'masjid-3.webp', isDefault: 0 }
];
for (const wp of wallpaperFiles) {
  insertWallpaper.run(masjidId, wp.name, wp.name, wp.isDefault, now);
}

db.close();
console.log('Database berhasil dibuat dan di-seed.');
console.log('  Masjid : ' + masjidName);
console.log('  Admin  : admin / [password yang dimasukkan]');
