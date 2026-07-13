#!/usr/bin/env node
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const dbPath = getArg('--db-path') || '/opt/digimos/database.db';
const password = getArg('--password');

if (!password) {
  console.error('ERROR: --password wajib diisi');
  process.exit(1);
}

const db = new Database(dbPath);
const passwordHash = bcrypt.hashSync(password, 10);

const result = db.prepare("UPDATE users SET password = ?, updated_at = ? WHERE username = 'admin'").run(passwordHash, new Date().toISOString());

if (result.changes === 0) {
  console.error('ERROR: User admin tidak ditemukan');
  db.close();
  process.exit(1);
}

db.prepare('DELETE FROM sessions').run();
db.close();

console.log('Password admin berhasil direset.');
console.log('Semua sesi aktif telah dihapus (logout otomatis).');
