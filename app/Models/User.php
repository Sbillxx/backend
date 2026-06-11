<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'team_id',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'urls' => 'array',
        ];
    }

    /**
     * Get the teams that the user belongs to.
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)->withPivot(['role', 'is_primary'])->withTimestamps();
    }

    /**
     * Get the primary team of the user.
     */
    public function primaryTeam()
    {
        return $this->teams()->wherePivot('is_primary', true)->first();
    }

    /**
     * Get the team that the user belongs to (backward compatibility).
     */
    public function team()
    {
        return $this->primaryTeam();
    }

    /**
     * Check if user belongs to a specific team
     */
    public function belongsToTeam($teamId): bool
    {
        return $this->teams()->where('team_id', $teamId)->exists();
    }

    /**
     * Get user's role in a specific team
     */
    public function getRoleInTeam($teamId): ?string
    {
        $pivot = $this->teams()->where('team_id', $teamId)->first()?->pivot;
        return $pivot?->role;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user can manage teams
     */
    public function canManageTeams(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Check if user can manage users
     */
    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get the projects owned by the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get the projects assigned to the user.
     */
    public function assignedProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user');
    }

    // Scope untuk filter berdasarkan team
    public function scopeInTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    // Scope untuk filter berdasarkan role
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            \App\Models\Anggota::create([
                'user_id' => $user->id,
                'nama' => $user->name,
                'jabatan' => 'Staff', // Default role for new users
                'status' => 'NORMAL',
                'divisi_id' => 1, // Default division
                'workload_percentage' => 0,
                'total_tasks' => 0,
                'active_tasks_count' => 0,
                'reliability' => 100.0,
                'weekly_output' => 0,
                'foto' => $user->profile_image ?? 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&format=png',
            ]);
        });
    }
}
