<?php
$anggotas = App\Models\Anggota::all();
foreach($anggotas as $a) {
    echo "Anggota: {$a->nama} (ID {$a->id}, User ID {$a->user_id})\n";
    $personalCount = $a->tasks()->count();
    $personalCompleted = $a->tasks()->where('status', 'COMPLETED')->count();
    $projectCount = App\Models\ProjectTask::where('assigned_to', $a->user_id)->count();
    $projectCompleted = App\Models\ProjectTask::where('assigned_to', $a->user_id)->where('status', 'completed')->count();
    
    $totalTasks = $personalCount + $projectCount;
    $completedTasks = $personalCompleted + $projectCompleted;
    $percentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
    
    echo "  Personal: $personalCompleted / $personalCount\n";
    echo "  Project: $projectCompleted / $projectCount\n";
    echo "  Total: $completedTasks / $totalTasks => $percentage%\n";
    echo "  DB Workload: {$a->workload_percentage}%\n\n";
}
