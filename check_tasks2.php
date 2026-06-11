<?php
$tasks = App\Models\Task::all();
foreach($tasks as $t) {
    echo "Task {$t->id}: anggota_id = {$t->anggota_id}, status = {$t->status}\n";
}
