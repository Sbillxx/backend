<?php
try {
    $pdo = new PDO('pgsql:host=db.qimortzhyllggwlrfzdx.supabase.co;port=5432;dbname=postgres', 'postgres', 'Manpro2122_');
    echo 'Connected successfully';
} catch (Exception $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
