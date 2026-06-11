<?php
$tasks = App\Models\Task::all();
foreach($tasks as $t) {
    // $t->anggota_id is currently holding the user_id!
    $correctAnggota = App\Models\Anggota::where('user_id', $t->anggota_id)->first();
    if ($correctAnggota) {
        $t->anggota_id = $correctAnggota->id;
        $t->save();
        echo "Fixed Task {$t->id} -> Anggota {$correctAnggota->id}\n";
    }
}
// Recalculate workloads
foreach(App\Models\Anggota::all() as $a) {
    $a->recalculateWorkload();
}
echo "Recalculation complete.\n";
