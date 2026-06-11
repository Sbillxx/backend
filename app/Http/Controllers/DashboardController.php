<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Load relationship teams untuk user (many-to-many)
        $user->load('teams');

        // Get active team from session (team switching)
        $activeTeamId = Session::get('active_team_id');
        $activeTeam = null;

        if ($activeTeamId) {
            $activeTeam = Team::find($activeTeamId);
            // Verify user still belongs to this team
            if ($activeTeam && !$user->belongsToTeam($activeTeamId)) {
                Session::forget('active_team_id');
                Session::forget('active_team');
                $activeTeam = null;
            }
        }

        // Get available teams
        $availableTeams = [];
        if ($user->isAdmin()) {
            // Admin bisa melihat semua teams
            $availableTeams = Team::where('is_active', true)->get();
        } else {
            // User biasa hanya bisa melihat teams yang dia ikuti
            $availableTeams = $user->teams;
        }

        // Filter projects berdasarkan active team atau user teams
        $projectsQuery = Project::with(['user', 'assignedUsers', 'tasks', 'team'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed');
            }]);

        if ($activeTeam) {
            // Filter berdasarkan active team
            $projectsQuery->where('team_id', $activeTeam->id);
        } else if (!$user->isAdmin()) {
            // Jika tidak ada active team dan user bukan admin, filter berdasarkan teams yang diikuti user
            $userTeamIds = $user->teams->pluck('id')->toArray();
            if (!empty($userTeamIds)) {
                $projectsQuery->whereIn('team_id', $userTeamIds);
            }
        }

        $projects = $projectsQuery->get()
            ->map(function ($project) {
                $daysUntilDue = null;
                $isOverdue = false;
                $isUrgent = false;

                if ($project->due_date) {
                    $daysUntilDue = Carbon::now()->diffInDays(Carbon::parse($project->due_date), false);
                    $isOverdue = $daysUntilDue < 0;
                    $isUrgent = $daysUntilDue >= 0 && $daysUntilDue <= 7;
                }

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'priority' => $project->priority,
                    'opd_owner' => $project->opd_owner,
                    'user' => $project->user,
                    'team' => $project->team,
                    'assigned_users' => $project->assignedUsers,
                    'due_date' => $project->due_date?->format('Y-m-d'),
                    'days_until_due' => $daysUntilDue,
                    'is_overdue' => $isOverdue,
                    'is_urgent' => $isUrgent,
                    'tasks_count' => $project->tasks_count,
                    'completed_tasks_count' => $project->completed_tasks_count,
                    'progress_percentage' => $project->progress_percentage,
                    'created_at' => $project->created_at->format('Y-m-d'),
                ];
            });

        // Group projects by Team instead of OPD
        $projectsByTeam = $projects->groupBy('team.name')->map(function ($teamProjects, $teamName) {
            $totalProjects = $teamProjects->count();
            $completedProjects = $teamProjects->where('status', 'completed')->count();
            $avgProgress = $totalProjects > 0 ? round($teamProjects->avg('progress_percentage')) : 0;

            return [
                'team_name' => $teamName ?: 'No Team',
                'total_projects' => $totalProjects,
                'completed_projects' => $completedProjects,
                'in_progress_projects' => $teamProjects->where('status', 'in_progress')->count(),
                'planning_projects' => $teamProjects->where('status', 'planning')->count(),
                'on_hold_projects' => $teamProjects->where('status', 'on_hold')->count(),
                'average_progress' => $avgProgress,
                'projects' => $teamProjects->values(),
            ];
        })->values();

        // Overall statistics
        $stats = [
            'total_projects' => $projects->count(),
            'completed_projects' => $projects->where('status', 'completed')->count(),
            'in_progress_projects' => $projects->where('status', 'in_progress')->count(),
            'planning_projects' => $projects->where('status', 'planning')->count(),
            'on_hold_projects' => $projects->where('status', 'on_hold')->count(),
            'overdue_projects' => $projects->where('is_overdue', true)->count(),
            'urgent_projects' => $projects->where('is_urgent', true)->count(),
            'average_progress' => $projects->count() > 0 ? round($projects->avg('progress_percentage')) : 0,
        ];

        // Chart data for project status
        $statusChartData = [
            ['name' => 'Completed', 'value' => $stats['completed_projects']],
            ['name' => 'In Progress', 'value' => $stats['in_progress_projects']],
            ['name' => 'Planning', 'value' => $stats['planning_projects']],
            ['name' => 'On Hold', 'value' => $stats['on_hold_projects']],
        ];

        // Chart data for Team progress
        $teamChartData = $projectsByTeam->map(function ($team) {
            return [
                'name' => $team['team_name'],
                'progress' => $team['average_progress'],
                'total_projects' => $team['total_projects'],
            ];
        })->values();

        // Recent projects (latest 5)
        $recentProjects = $projects->sortByDesc('created_at')->take(5)->values();

        // Urgent projects (due within 7 days or overdue)
        $urgentProjects = $projects->filter(function ($project) {
            return $project['is_urgent'] || $project['is_overdue'];
        })->sortBy('days_until_due')->values();

        return Inertia::render('dashboard/index', [
            'projects' => $projects,
            'stats' => $stats,
            'projects_by_team' => $projectsByTeam,
            'status_chart_data' => $statusChartData,
            'team_chart_data' => $teamChartData,
            'recent_projects' => $recentProjects,
            'urgent_projects' => $urgentProjects,
            'active_team' => $activeTeam,
            'available_teams' => $availableTeams,
            'user_teams' => $user->teams,
            'user_role' => $user->role,
            'can_manage_projects' => $user->isAdmin(),
        ]);
    }
}
