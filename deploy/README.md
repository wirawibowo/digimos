# DigiMOS - Panduan Instalasi

```
     ____  _       _ __  __  ___  ____
    |  _ \(_) __ _(_)  \/  |/ _ \/ ___|
    | | | | |/ _` | | |\/| | | | \___ \
    | |_| | | (_| | | |  | | |_| |___) |
    |____/|_|\__, |_|_|  |_|\___/|____/
             |___/
```

Sistem display masjid berbasis web untuk STB B860H dan perangkat Ubuntu lainnya.

---

## Apa yang Dibutuhkan

| Kebutuhan | Keterangan |
|-----------|-----------|
| **Perangkat** | STB B860H atau PC/server dengan Ubuntu (ARM64 atau x86_64) |
| **RAM** | Minimal 2GB |
| **Storage** | Minimal 1GB ruang kosong |
| **Internet** | Diperlukan saat instalasi (download dependencies) |
| **Transfer file** | USB flash drive atau akses SSH |

> **Catatan:** Setelah instalasi selesai, internet hanya diperlukan untuk sinkronisasi jadwal sholat (1x per bulan).

---

## Cara Install (3 Langkah)

### Langkah 1: Copy file ke STB

Anda hanya perlu **1 file**: `digimos-bundle.tar.gz`

**Cara A — Via USB flash drive:**

1. Copy file `digimos-bundle.tar.gz` ke USB flash drive
2. Colokkan USB ke STB
3. Buka terminal di STB, ketik:

```bash
# Mount USB
sudo mount /dev/sda1 /mnt

# Copy file ke home directory
cp /mnt/digimos-bundle.tar.gz ~/

# Lepas USB
sudo umount /mnt
```

**Cara B — Via jaringan (SCP):**

Dari komputer lain yang terhubung ke jaringan yang sama:

```bash
scp digimos-bundle.tar.gz user@IP_STB:~/
```

> **Tips:** Untuk mengetahui IP STB, ketik `hostname -I` di terminal STB.

---

### Langkah 2: Extract file

```bash
cd ~
tar -xzf digimos-bundle.tar.gz
cd digimos-bundle
```

---

### Langkah 3: Jalankan installer

```bash
sudo bash install.sh
```

Installer akan menanyakan **3 hal saja**:

| Pertanyaan | Contoh Jawaban |
|------------|---------------|
| Nama Masjid | `Masjid Al-Ikhlas` |
| Password Admin | `minimal 6 karakter` |
| Web Server | Otomatis jika sudah ada Nginx/Apache |

Tunggu **3-5 menit** sampai instalasi selesai. Installer akan otomatis:

- Install Node.js 20 (jika belum ada)
- Install Nginx atau Apache (jika belum ada)
- Setup database SQLite dengan data awal
- Konfigurasi reverse proxy
- Membuat service auto-start

---

## Setelah Install

### Akses Panel Admin

Buka browser (di HP, laptop, atau komputer lain) dan ketik:

```
http://IP_STB
```

Contoh: `http://192.168.1.100`

Login dengan:
- **Username:** `admin`
- **Password:** password yang dimasukkan saat install

### Akses Display TV

Buka browser di STB atau Smart TV:

```
http://IP_STB/display/1
```

> **Tips:** Buka link display di browser fullscreen (tekan F11) untuk tampilan terbaik.

---

## Perintah Berguna

| Perintah | Fungsi |
|----------|--------|
| `sudo systemctl status digimos` | Cek status aplikasi |
| `sudo systemctl restart digimos` | Restart aplikasi |
| `sudo systemctl stop digimos` | Matikan aplikasi |
| `sudo systemctl start digimos` | Nyalakan aplikasi |
| `sudo journalctl -u digimos -f` | Lihat log realtime |
| `sudo journalctl -u digimos --since today` | Log hari ini |

---

## Reset Password Admin

Jika lupa password, **tidak perlu hapus database**. Cukup jalankan:

```bash
sudo bash /opt/digimos/reset-password.sh
```

Script akan meminta password baru, lalu otomatis restart aplikasi.

---

## Troubleshooting

### Tidak bisa akses dari browser

1. Cek apakah service berjalan:
   ```bash
   sudo systemctl status digimos
   ```
2. Cek IP STB:
   ```bash
   hostname -I
   ```
3. Pastikan port 80 tidak diblokir firewall:
   ```bash
   sudo ufw allow 80
   ```

### Service gagal start

1. Lihat error:
   ```bash
   sudo journalctl -u digimos -n 50
   ```
2. Cek konfigurasi:
   ```bash
   cat /opt/digimos/.env
   ```
3. Restart:
   ```bash
   sudo systemctl restart digimos
   ```

### Halaman blank / error 502

Web server berjalan tapi Node.js belum siap:

```bash
# Cek apakah Node.js berjalan
sudo systemctl status digimos

# Restart jika perlu
sudo systemctl restart digimos

# Tunggu 5 detik, lalu refresh browser
```

### Install ulang

Jalankan kembali installer dari folder bundle:

```bash
cd ~/digimos-bundle
sudo bash install.sh
```

> **Aman:** Database yang sudah ada **tidak akan ditimpa** — data masjid, jadwal, dan pengaturan tetap tersimpan.

---

## Lokasi File

| File/Folder | Lokasi |
|-------------|--------|
| Aplikasi | `/opt/digimos/` |
| Database | `/opt/digimos/database.db` |
| Upload wallpaper | `/opt/digimos/uploads/` |
| Konfigurasi | `/opt/digimos/.env` |
| Service | `/etc/systemd/system/digimos.service` |
| Nginx config | `/etc/nginx/sites-available/digimos` |
| Apache config | `/etc/apache2/sites-available/digimos.conf` |

---

## FAQ

**Q: Apakah perlu internet setelah install?**
A: Hanya untuk sinkronisasi jadwal sholat (otomatis, 1x per bulan). Selain itu bisa jalan offline.

**Q: Bisa install di lebih dari satu STB?**
A: Bisa. Copy file `digimos-bundle.tar.gz` yang sama ke STB lain dan jalankan installer.

**Q: Bagaimana cara update ke versi terbaru?**
A: Download bundle terbaru, copy ke STB, dan jalankan `sudo bash install.sh` lagi. Database tidak akan hilang.

**Q: Port berapa yang dipakai?**
A: Web server di port 80 (Nginx/Apache), aplikasi Node.js di port 3000 (internal).
