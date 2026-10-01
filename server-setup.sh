#!/usr/bin/env bash
# Ronix Brand Guidelines — one-shot server setup.
# Run ON the server, as a user with sudo. Safe to re-run.
set -euo pipefail

SITE_DIR=/var/www/brand
SERVER_NAME="${1:-_}"          # pass a hostname, e.g. brand.ronixtools.com

echo "==> Installing nginx"
if command -v apt-get >/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y nginx
elif command -v dnf >/dev/null; then
  sudo dnf install -y nginx
else
  echo "Unsupported package manager; install nginx manually." >&2; exit 1
fi

echo "==> Creating $SITE_DIR"
sudo mkdir -p "$SITE_DIR"
sudo chown -R "$USER":"$USER" "$SITE_DIR"

echo "==> Writing nginx site config"
sudo tee /etc/nginx/conf.d/brand.conf >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    root ${SITE_DIR};
    index index.html;

    # The guide is static. Serve pretty URLs, fall back to 404.
    location / {
        try_files \$uri \$uri.html \$uri/ =404;
    }

    # Assets are versioned with ?v=NN, so they can be cached hard.
    location ~* \.(css|js|svg|jpg|jpeg|png|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML stays short so edits appear without a purge.
    location ~* \.html$ {
        expires 5m;
        add_header Cache-Control "public, must-revalidate";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 512;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Basic hardening for a document site.
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # --- Access control -------------------------------------------------
    # Uncomment ONE of these once you have decided who may read the guide.
    #
    # (a) Corporate network only:
    # allow 10.0.0.0/8;
    # deny  all;
    #
    # (b) Shared password (create the file with:
    #     sudo htpasswd -c /etc/nginx/.htpasswd ronix):
    # auth_basic "Ronix Brand Guidelines";
    # auth_basic_user_file /etc/nginx/.htpasswd;
}
NGINX

# Debian/Ubuntu ships a default site that would shadow ours on "_".
if [ -e /etc/nginx/sites-enabled/default ]; then
  echo "==> Disabling nginx default site"
  sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Testing config"
sudo nginx -t

echo "==> Enabling and restarting nginx"
sudo systemctl enable nginx
sudo systemctl restart nginx

if command -v firewall-cmd >/dev/null; then
  sudo firewall-cmd --permanent --add-service=http  || true
  sudo firewall-cmd --permanent --add-service=https || true
  sudo firewall-cmd --reload || true
elif command -v ufw >/dev/null; then
  sudo ufw allow 'Nginx Full' || true
fi

echo
echo "Done. Upload the site into $SITE_DIR, then browse to http://$(hostname -I | awk '{print $1}')/"
