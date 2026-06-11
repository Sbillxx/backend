<?php
$staff = App\Models\Anggota::all();
foreach($staff as $s) {
    echo 'ID: ' . $s->id . ' Name: ' . $s->nama . ' Foto: ' . $s->foto . PHP_EOL;
}
