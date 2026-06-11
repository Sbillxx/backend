<?php
foreach(App\Models\Anggota::all() as $a) {
    echo "Anggota ID: {$a->id}, Nama: {$a->nama}\n";
}
