<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anggota extends Model
{
    protected $fillable = [
        'user_id', 'divisi_id', 'nama', 'jabatan', 'foto', 'status',
        'workload_percentage', 'total_tasks', 'active_tasks_count',
        'reliability', 'weekly_output'
    ];

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function recalculateWorkload(): void
    {
        // 1. Get all projects where this staff is assigned
        $projects = Project::where('assigned_staff', 'like', '%"' . $this->nama . '"%')->get();
        
        // 2. Count personal tasks
        $personalCount = $this->tasks()->count();
        $personalActive = $this->tasks()->where('status', 'ACTIVE')->count();
        
        // 3. Count project tasks (using user_id)
        $projectCount = 0;
        $projectActive = 0;
        
        if ($this->user_id) {
            $projectCount = ProjectTask::where('assigned_to', $this->user_id)->count();
            $projectActive = ProjectTask::where('assigned_to', $this->user_id)->where('status', '!=', 'completed')->count();
        }
        
        // 4. Update total and active counts in DB
        $this->total_tasks = $personalCount + $projectCount;
        $this->active_tasks_count = $personalActive + $projectActive;
        
        // 5. Calculate average project progress
        if ($projects->isNotEmpty()) {
            $averageProgress = $projects->avg('progress');
            $percentage = round($averageProgress);
        } else {
            $percentage = 0;
        }
        
        // Keep it between 0% and 100%
        $this->workload_percentage = max(0, min(100, $percentage));
        
        // Calculate weekly output: completed tasks in the last 7 days (personal + project tasks)
        $weeklyPersonalCompleted = $this->tasks()
            ->where('status', 'COMPLETED')
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();
            
        $weeklyProjectCompleted = 0;
        if ($this->user_id) {
            $weeklyProjectCompleted = ProjectTask::where('assigned_to', $this->user_id)
                ->where('status', 'completed')
                ->where('updated_at', '>=', now()->subDays(7))
                ->count();
        }
        
        $this->weekly_output = $weeklyPersonalCompleted + $weeklyProjectCompleted;
        
        // 6. Update status based on total active tasks (workload risk)
        $totalActive = $this->active_tasks_count;
        if ($totalActive >= 6) {
            $this->status = 'AT RISK';
        } elseif ($totalActive >= 4) {
            $this->status = 'HIGH';
        } else {
            $this->status = 'NORMAL';
        }
        
        $this->save();
    }
}
