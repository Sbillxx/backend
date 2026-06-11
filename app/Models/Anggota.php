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
        
        // 2. Count active tasks
        $activeTasks = $this->tasks()->where('status', 'ACTIVE')->count();
        
        // 3. Calculate average project progress:
        if ($projects->isNotEmpty()) {
            $averageProgress = $projects->avg('progress');
            $percentage = round($averageProgress);
        } else {
            $percentage = 0;
        }
        
        // Keep it between 0% and 100%
        $this->workload_percentage = max(0, min(100, $percentage));
        
        // Calculate weekly output: completed tasks in the last 7 days
        $weeklyOutput = $this->tasks()
            ->where('status', 'COMPLETED')
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();
        $this->weekly_output = $weeklyOutput;
        
        // 4. Update status based on active tasks (workload risk)
        if ($activeTasks >= 6) {
            $this->status = 'AT RISK';
        } elseif ($activeTasks >= 4) {
            $this->status = 'HIGH';
        } else {
            $this->status = 'NORMAL';
        }
        
        $this->save();
    }
}
