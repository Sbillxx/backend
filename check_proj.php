<?php
$p = App\Models\Project::where('assigned_staff', 'like', '%"John Doe"%')->get();
foreach($p as $proj) {
    echo 'Project: ' . $proj->name . ' Progress: ' . $proj->progress . PHP_EOL;
}
