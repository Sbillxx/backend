<?php
$staffList = App\Models\Anggota::all();
foreach($staffList as $staff) {
    echo $staff->nama . " - Total Tasks: " . $staff->tasks()->count() . ", Completed: " . $staff->tasks()->where('status', 'COMPLETED')->count() . PHP_EOL;
}
