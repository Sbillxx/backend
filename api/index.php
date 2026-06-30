<?php
<<<<<<< HEAD
// Forward request to the public index.php
=======

// Paksa Laravel buat simpan file sementara (cache/session/views) di folder /tmp
// Karena Vercel itu "read-only" (cuma /tmp yang bisa ditulis)
$_ENV['APP_CONFIG_CACHE'] = '/tmp/config.php';
$_ENV['APP_EVENTS_CACHE'] = '/tmp/events.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/packages.php';
$_ENV['APP_ROUTES_CACHE'] = '/tmp/routes.php';
$_ENV['APP_SERVICES_CACHE'] = '/tmp/services.php';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';
$_ENV['CACHE_STORE'] = 'array';
$_ENV['SESSION_DRIVER'] = 'cookie';

>>>>>>> 1590130aa88da3ee0a99c14e1c9ed8371c010d42
require __DIR__ . '/../public/index.php';
