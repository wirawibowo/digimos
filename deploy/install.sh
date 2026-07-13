#!/bin/bash
set -e

# ============================================================
#  DigiMOS Installer - Sistem Display Masjid
#  Target: STB B860H / Ubuntu ARM64 atau x64
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

INSTALL_DIR="/opt/digimos"
SERVICE_NAME="digimos"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ok()   { echo -e "  ${GREEN}[OK]${NC} $1"; }
fail() { echo -e "  ${RED}[FAIL]${NC} $1"; exit 1; }
skip() { echo -e "  ${YELLOW}[SKIP]${NC} $1"; }
info() { echo -e "  ${CYAN}[INFO]${NC} $1"; }

header() {
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BOLD}═══════════════════════════════════════════${NC}"
}

# ── Fase 1: Cek Root ─────────────────────────────────────────
header "DigiMOS Installer"
echo ""
echo "  Sistem display masjid berbasis web"
echo "  Membutuhkan: Node.js, Nginx/Apache, SQLite"
echo ""

if [ "$EUID" -ne 0 ]; then
  fail "Jalankan sebagai root: sudo bash install.sh"
fi

# ── Fase 2: Input User ──────────────────────────────────────
header "Konfigurasi"

read -p "  Nama Masjid: " MASJID_NAME
while [ -z "$MASJID_NAME" ]; do
  echo -e "  ${RED}Nama masjid tidak boleh kosong${NC}"
  read -p "  Nama Masjid: " MASJID_NAME
done

while true; do
  read -s -p "  Password Admin: " ADMIN_PASS
  echo ""
  if [ ${#ADMIN_PASS} -lt 6 ]; then
    echo -e "  ${RED}Password minimal 6 karakter${NC}"
    continue
  fi
  read -s -p "  Ulangi Password: " ADMIN_PASS2
  echo ""
  if [ "$ADMIN_PASS" != "$ADMIN_PASS2" ]; then
    echo -e "  ${RED}Password tidak cocok${NC}"
    continue
  fi
  break
done

# ── Fase 3: Auto-detect Web Server ──────────────────────────
header "Deteksi Web Server"

WEB_SERVER=""
if command -v nginx &>/dev/null; then
  WEB_SERVER="nginx"
  ok "Nginx terdeteksi"
elif command -v apache2 &>/dev/null || command -v httpd &>/dev/null; then
  WEB_SERVER="apache"
  ok "Apache terdeteksi"
else
  info "Tidak ada web server terdeteksi"
  echo ""
  echo "  Pilih web server yang ingin diinstall:"
  echo "  [1] Nginx (Rekomendasi - ringan)"
  echo "  [2] Apache"
  echo ""
  while true; do
    read -p "  Pilihan [1/2]: " WS_CHOICE
    case $WS_CHOICE in
      1) WEB_SERVER="nginx"; break;;
      2) WEB_SERVER="apache"; break;;
      *) echo -e "  ${RED}Pilih 1 atau 2${NC}";;
    esac
  done
fi

# Deteksi IP
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$HOST_IP" ] && HOST_IP="localhost"
info "Alamat akses: http://$HOST_IP"

echo ""
echo -e "  ${BOLD}Ringkasan:${NC}"
echo "  Masjid    : $MASJID_NAME"
echo "  Web Server: $WEB_SERVER"
echo "  Database  : SQLite"
echo "  Alamat    : http://$HOST_IP"
echo ""
read -p "  Lanjutkan instalasi? [Y/n]: " CONFIRM
CONFIRM=${CONFIRM:-Y}
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Instalasi dibatalkan."
  exit 0
fi

# ── Fase 4: Install Dependencies ────────────────────────────
header "Install Dependencies"

apt-get update -qq
apt-get install -y -qq curl build-essential python3 > /dev/null 2>&1
ok "curl, build-essential, python3"

# ── Fase 5: Install Node.js ─────────────────────────────────
header "Install Node.js"

if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  ok "Node.js sudah terinstall ($NODE_VER)"
else
  info "Menginstall Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null 2>&1
  NODE_VER=$(node -v)
  ok "Node.js $NODE_VER terinstall"
fi

# ── Fase 6: Install Web Server ──────────────────────────────
header "Setup Web Server"

if [ "$WEB_SERVER" = "nginx" ]; then
  if ! command -v nginx &>/dev/null; then
    apt-get install -y -qq nginx > /dev/null 2>&1
    ok "Nginx terinstall"
  else
    skip "Nginx sudah ada"
  fi
elif [ "$WEB_SERVER" = "apache" ]; then
  if ! command -v apache2 &>/dev/null && ! command -v httpd &>/dev/null; then
    apt-get install -y -qq apache2 > /dev/null 2>&1
    ok "Apache terinstall"
  else
    skip "Apache sudah ada"
  fi
  a2enmod proxy proxy_http > /dev/null 2>&1
  ok "Apache modules enabled (proxy, proxy_http)"
fi

# ── Fase 7: Setup Folder ────────────────────────────────────
header "Setup Aplikasi"

if id "digimos" &>/dev/null; then
  skip "User 'digimos' sudah ada"
else
  useradd --system --no-create-home --shell /usr/sbin/nologin digimos
  ok "User 'digimos' dibuat"
fi

mkdir -p "$INSTALL_DIR"

if [ -d "$SCRIPT_DIR/build" ]; then
  cp -r "$SCRIPT_DIR/build" "$INSTALL_DIR/"
  ok "Build files disalin"
else
  fail "Folder build/ tidak ditemukan. Pastikan bundle sudah di-extract."
fi

cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/package-lock.json" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/seed.mjs" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/reset-password.mjs" "$INSTALL_DIR/" 2>/dev/null || true
cp "$SCRIPT_DIR/reset-password.sh" "$INSTALL_DIR/" 2>/dev/null || true
ok "Package files disalin"

# ── Fase 8: npm install ─────────────────────────────────────
header "Install Node Modules"

info "Menginstall dependencies (mungkin butuh beberapa menit)..."
cd "$INSTALL_DIR"
npm ci --production --loglevel=error 2>&1
ok "Dependencies terinstall"

# ── Fase 9: Setup Database ──────────────────────────────────
header "Setup Database"

DB_PATH="$INSTALL_DIR/database.db"

if [ -f "$DB_PATH" ]; then
  skip "Database sudah ada, melewati seed"
else
  node seed.mjs --db-path "$DB_PATH" --password "$ADMIN_PASS" --masjid-name "$MASJID_NAME"
  ok "Database dibuat dan di-seed"
fi

# ── Fase 10: Setup Uploads ──────────────────────────────────
header "Setup Uploads"

UPLOADS_DIR="$INSTALL_DIR/uploads"
CLIENT_UPLOADS="$INSTALL_DIR/build/client/uploads"

mkdir -p "$UPLOADS_DIR"

if [ -L "$CLIENT_UPLOADS" ]; then
  skip "Symlink uploads sudah ada"
elif [ -d "$CLIENT_UPLOADS" ]; then
  cp -r "$CLIENT_UPLOADS/"* "$UPLOADS_DIR/" 2>/dev/null || true
  rm -rf "$CLIENT_UPLOADS"
  ln -s "$UPLOADS_DIR" "$CLIENT_UPLOADS"
  ok "Uploads dimigrasikan dan symlink dibuat"
else
  ln -s "$UPLOADS_DIR" "$CLIENT_UPLOADS"
  ok "Symlink uploads dibuat"
fi

# ── Fase 11: Environment File ───────────────────────────────
header "Konfigurasi Environment"

cat > "$INSTALL_DIR/.env" << EOF
PORT=3000
NODE_ENV=production
ORIGIN=http://$HOST_IP
DATABASE_PATH=$DB_PATH
EOF
ok "File .env dibuat"

# Set permissions
chown -R digimos:digimos "$INSTALL_DIR"
chmod 750 "$INSTALL_DIR"
ok "Permission diatur"

# ── Fase 12: Web Server Config ──────────────────────────────
header "Konfigurasi Web Server"

if [ "$WEB_SERVER" = "nginx" ]; then
  NGINX_CONF="/etc/nginx/sites-available/digimos"
  sed "s/__HOSTNAME__/$HOST_IP/g" "$SCRIPT_DIR/digimos-nginx.conf" > "$NGINX_CONF"

  if [ -d /etc/nginx/sites-enabled ]; then
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/digimos
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  fi

  nginx -t > /dev/null 2>&1 || fail "Nginx config tidak valid"
  systemctl reload nginx
  ok "Nginx dikonfigurasi dan di-reload"

elif [ "$WEB_SERVER" = "apache" ]; then
  APACHE_CONF="/etc/apache2/sites-available/digimos.conf"
  sed "s/__HOSTNAME__/$HOST_IP/g" "$SCRIPT_DIR/digimos-apache.conf" > "$APACHE_CONF"

  a2ensite digimos > /dev/null 2>&1
  a2dissite 000-default > /dev/null 2>&1 || true

  apache2ctl configtest > /dev/null 2>&1 || fail "Apache config tidak valid"
  systemctl reload apache2
  ok "Apache dikonfigurasi dan di-reload"
fi

# ── Fase 13: Systemd Service ────────────────────────────────
header "Setup Service"

cp "$SCRIPT_DIR/digimos.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable "$SERVICE_NAME" > /dev/null 2>&1
systemctl restart "$SERVICE_NAME"

sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
  ok "Service berjalan"
else
  fail "Service gagal start. Cek: journalctl -u digimos"
fi

# ── Summary ─────────────────────────────────────────────────
header "Instalasi Selesai!"
echo ""
echo -e "  ${GREEN}DigiMOS berhasil diinstall!${NC}"
echo ""
echo -e "  ${BOLD}Akses:${NC}      http://$HOST_IP"
echo -e "  ${BOLD}Username:${NC}   admin"
echo -e "  ${BOLD}Password:${NC}   [password yang dimasukkan tadi]"
echo ""
echo -e "  ${BOLD}Perintah berguna:${NC}"
echo "  Status  : sudo systemctl status digimos"
echo "  Restart : sudo systemctl restart digimos"
echo "  Log     : sudo journalctl -u digimos -f"
echo ""
