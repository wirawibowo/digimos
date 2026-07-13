# DigiMOS - Panduan Instalasi

Sistem display masjid berbasis web untuk STB B860H dan perangkat Ubuntu lainnya.

## Persyaratan

- STB B860H (atau perangkat lain) dengan Ubuntu terinstall
- Koneksi internet (untuk download dependencies saat install)
- USB flash drive atau akses SSH untuk transfer file

## Cara Install

### Langkah 1: Copy file ke STB

**Via USB:**
1. Copy file `digimos-bundle.tar.gz` ke USB flash drive
2. Colokkan USB ke STB
3. Buka terminal, mount USB dan copy file:
   ```
   sudo mount /dev/sda1 /mnt
   cp /mnt/digimos-bundle.tar.gz ~/
   sudo umount /mnt
   ```

**Via SCP (dari komputer lain):**
```
scp digimos-bundle.tar.gz user@IP_STB:~/
```

### Langkah 2: Extract

```
cd ~
tar -xzf digimos-bundle.tar.gz
cd digimos-bundle
```

### Langkah 3: Install

```
sudo bash install.sh
```

Script akan menanyakan:
1. **Nama Masjid** - nama yang akan ditampilkan di display
2. **Password Admin** - untuk login ke panel admin (minimal 6 karakter)
3. **Web Server** - Nginx atau Apache (otomatis jika sudah terinstall)

Tunggu sampai instalasi selesai (sekitar 3-5 menit).

### Langkah 4: Akses

Buka browser dan ketik alamat IP STB:
```
http://IP_STB
```

Login dengan:
- Username: `admin`
- Password: [password yang dimasukkan saat install]

## Perintah Berguna

| Perintah | Fungsi |
|----------|--------|
| `sudo systemctl status digimos` | Cek status aplikasi |
| `sudo systemctl restart digimos` | Restart aplikasi |
| `sudo systemctl stop digimos` | Matikan aplikasi |
| `sudo journalctl -u digimos -f` | Lihat log realtime |
| `sudo journalctl -u digimos --since today` | Log hari ini |

## Troubleshooting

### Tidak bisa akses dari browser
1. Cek apakah service berjalan: `sudo systemctl status digimos`
2. Cek IP STB: `hostname -I`
3. Pastikan port 80 tidak diblokir firewall

### Service gagal start
1. Lihat error: `sudo journalctl -u digimos -n 50`
2. Cek file .env: `cat /opt/digimos/.env`
3. Restart: `sudo systemctl restart digimos`

### Lupa password admin
```
sudo bash /opt/digimos/reset-password.sh
```

### Install ulang
Jalankan kembali `sudo bash install.sh` dari folder bundle.
Database yang sudah ada tidak akan ditimpa (seed di-skip jika database sudah ada).
