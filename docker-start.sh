#!/bin/bash
set -e

# Configure Apache port (Render sets PORT env variable)
if [ -n "$PORT" ]; then
    sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \*:80>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/000-default.conf
fi

echo "=== Caching Laravel config ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "=== Running migrations ==="
php artisan migrate --force

echo "=== Linking storage ==="
php artisan storage:link || true

echo "=== Starting Apache ==="
exec apache2-foreground
