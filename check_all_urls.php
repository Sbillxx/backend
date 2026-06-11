<?php
echo "=== ANGGOTA ===\n";
foreach(App\Models\Anggota::all() as $s) {
    echo "Anggota ID {$s->id} ({$s->nama}): {$s->foto}\n";
}
echo "=== USER ===\n";
foreach(App\Models\User::all() as $u) {
    echo "User ID {$u->id} ({$u->name}): {$u->profile_image}\n";
}
