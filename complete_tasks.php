<?php
// Complete half of the personal tasks for Shadcn User (user_id 2)
$tasks = App\Models\Task::where('anggota_id', 6)->get();
foreach($tasks as $index => $t) {
    if ($index % 2 == 0) {
        $t->status = 'COMPLETED';
        $t->save();
    }
}

// Complete half of the personal tasks for Admin User (user_id 3)
$tasks = App\Models\Task::where('anggota_id', 7)->get();
foreach($tasks as $index => $t) {
    if ($index % 2 == 0) {
        $t->status = 'COMPLETED';
        $t->save();
    }
}

// Complete half of the ProjectTasks for John Doe (user_id 4)
$pTasks = App\Models\ProjectTask::where('assigned_to', 4)->get();
foreach($pTasks as $index => $t) {
    if ($index % 2 == 0) {
        $t->status = 'completed';
        $t->save();
    }
}

// Complete half of the personal tasks for John Doe (user_id 4)
$tasks = App\Models\Task::where('anggota_id', 8)->get();
foreach($tasks as $index => $t) {
    if ($index % 2 == 0) {
        $t->status = 'COMPLETED';
        $t->save();
    }
}

// Recalculate workloads
foreach(App\Models\Anggota::all() as $a) {
    $a->recalculateWorkload();
}

echo "Tasks updated and workloads recalculated.\n";
