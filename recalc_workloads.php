<?php
App\Models\Anggota::all()->each(function($a) {
    $a->recalculateWorkload();
    $a->save();
});
echo "Workloads recalculated!\n";
