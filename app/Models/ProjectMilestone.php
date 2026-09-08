<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'due_date',
        'status',
        'order',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    protected $appends = [
        'progress_percentage',
        'completed_tasks_count',
        'total_tasks_count',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class, 'milestone_id');
    }

    public function getCompletedTasksCountAttribute(): int
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function getTotalTasksCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    public function getProgressPercentageAttribute(): float
    {
        $total = $this->total_tasks_count;
        if ($total > 0) {
            return round(($this->completed_tasks_count / $total) * 100, 1);
        }
        return $this->status === 'completed' ? 100.0 : 0.0;
    }
}
