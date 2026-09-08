<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
        'user_id',
        'team_id',
        'opd_owner',
        'target_date',
        'progress',
        'workload',
        'divisi_id',
        'assigned_staff',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    // Many-to-many relationship for assigned users
    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }

    public function bugs(): HasMany
    {
        return $this->hasMany(ProjectBug::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('order')->orderBy('id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ProjectReport::class);
    }

    public function recalculateProgress(): float
    {
        $milestones = $this->milestones;
        $totalMilestones = $milestones->count();

        if ($totalMilestones > 0) {
            $totalProgressSum = 0;
            foreach ($milestones as $milestone) {
                $totalTasks = $milestone->tasks()->count();
                if ($totalTasks > 0) {
                    $completedTasks = $milestone->tasks()->where('status', 'completed')->count();
                    $mProgress = ($completedTasks / $totalTasks) * 100;
                    
                    if ($completedTasks === $totalTasks && $milestone->status !== 'completed') {
                        $milestone->update(['status' => 'completed']);
                    }
                } else {
                    $mProgress = match ($milestone->status) {
                        'completed' => 100,
                        'in_progress' => 50,
                        default => 0,
                    };
                }
                $totalProgressSum += $mProgress;
            }
            $calculatedProgress = round($totalProgressSum / $totalMilestones, 1);
        } else {
            $totalTasks = $this->tasks()->count();
            if ($totalTasks > 0) {
                $completedTasks = $this->tasks()->where('status', 'completed')->count();
                $calculatedProgress = round(($completedTasks / $totalTasks) * 100, 1);
            } else {
                $calculatedProgress = (float)($this->progress ?? 0);
            }
        }

        $this->update(['progress' => $calculatedProgress]);
        return $calculatedProgress;
    }

    // Scope untuk filter berdasarkan team
    public function scopeForTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function getProgressPercentageAttribute()
    {
        return $this->progress ?? 0;
    }

    public function getCompletedTasksCountAttribute()
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function getTotalTasksCountAttribute()
    {
        return $this->tasks()->count();
    }
}
