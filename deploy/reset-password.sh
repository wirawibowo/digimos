#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

INSTALL_DIR="/opt/digimos"

echo ""
echo -e "${BOLD}DigiMOS - Reset Password Admin${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Jalankan sebagai root: sudo bash reset-password.sh${NC}"
  exit 1
fi

while true; do
  read -s -p "  Password baru: " NEW_PASS
  echo ""
  if [ ${#NEW_PASS} -lt 6 ]; then
    echo -e "  ${RED}Password minimal 6 karakter${NC}"
    continue
  fi
  read -s -p "  Ulangi password: " NEW_PASS2
  echo ""
  if [ "$NEW_PASS" != "$NEW_PASS2" ]; then
    echo -e "  ${RED}Password tidak cocok${NC}"
    continue
  fi
  break
done

cd "$INSTALL_DIR"
node reset-password.mjs --db-path "$INSTALL_DIR/database.db" --password "$NEW_PASS"

systemctl restart digimos 2>/dev/null || true

echo ""
echo -e "${GREEN}Password admin berhasil direset!${NC}"
echo "  Username: admin"
echo "  Password: [password baru yang dimasukkan]"
echo ""
