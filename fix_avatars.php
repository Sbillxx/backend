<?php
$staff = App\Models\Anggota::all();
foreach($staff as $s) {
    if (strpos($s->foto, 'ui-avatars.com') !== false && strpos($s->foto, 'format=png') === false) {
        $s->foto = $s->foto . '&format=png';
        $s->save();
        echo 'Fixed ' . $s->nama . PHP_EOL;
    }
}
