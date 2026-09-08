<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $user->load('teams');

        // Get active team from session (same as DashboardController)
        $activeTeamId = \Illuminate\Support\Facades\Session::get('active_team_id');
        $activeTeam = null;

        if ($activeTeamId) {
            $activeTeam = Team::find($activeTeamId);
            // Verify user still belongs to this team
            if ($activeTeam && !$user->belongsToTeam($activeTeamId)) {
                \Illuminate\Support\Facades\Session::forget('active_team_id');
                \Illuminate\Support\Facades\Session::forget('active_team');
                $activeTeam = null;
            }
        }

        // Get filter parameters (remove team filter since it's handled by team switcher)
        $status = $request->get('status');
        $search = $request->get('search');

        // Filter projects berdasarkan active team atau user teams
        $projectsQuery = Project::with(['user', 'team', 'tasks.assignedUser', 'assignedUsers'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed');
            }]);

        // Apply status filter
        if ($status && in_array($status, ['planning', 'in_progress', 'completed', 'on_hold'])) {
            $projectsQuery->where('status', $status);
        }

        // Apply search filter
        if ($search) {
            $projectsQuery->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter based on active team (same logic as DashboardController)
        if ($activeTeam) {
            // Filter berdasarkan active team
            $projectsQuery->where('team_id', $activeTeam->id);
        } else if (!$user->isAdmin()) {
            // Jika tidak ada active team dan user bukan admin, filter berdasarkan kepemilikan, penugasan, atau tim
            $userTeamIds = $user->teams->pluck('id')->toArray();
            
            $projectsQuery->where(function($q) use ($user, $userTeamIds) {
                // User sebagai owner
                $q->where('user_id', $user->id)
                  // User sebagai assigned user
                  ->orWhereHas('assignedUsers', function($q2) use ($user) {
                      $q2->where('users.id', $user->id);
                  });
                  
                // Project di team user
                if (!empty($userTeamIds)) {
                    $q->orWhereIn('team_id', $userTeamIds);
                }
            });
        }

        $projects = $projectsQuery->latest()
            ->get()
            ->map(function ($project) use ($user) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'priority' => $project->priority,
                    'start_date' => $project->start_date?->format('Y-m-d'),
                    'due_date' => $project->due_date?->format('Y-m-d'),
                    'user' => $project->user,
                    'team' => $project->team,
                    'assigned_users' => $project->assignedUsers ?? [],
                    'opd_owner' => $project->opd_owner,
                    'tasks_count' => $project->tasks_count,
                    'completed_tasks_count' => $project->completed_tasks_count,
                    'progress_percentage' => $project->progress_percentage ?? 0,
                    'progress' => $project->progress ?? 0,
                    'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                    'can_edit' => $user->isAdmin(),
                    'can_delete' => $user->isAdmin(),
                ];
            });

        // Get users berdasarkan teams untuk assignment
        $usersQuery = User::with('teams')->where('is_active', true);
        if (!$user->isAdmin()) {
            // For non-admin users, get users from their teams
            $userTeamIds = $user->teams->pluck('id')->toArray();
            if (!empty($userTeamIds)) {
                $usersQuery->whereHas('teams', function($query) use ($userTeamIds) {
                    $query->whereIn('teams.id', $userTeamIds);
                });
            }
        }
        $users = $usersQuery->get();

        // Get teams untuk admin atau teams yang diikuti user
        $teams = $user->isAdmin() ? Team::where('is_active', true)->get() : $user->teams;

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'users' => $users,
            'teams' => $teams,
            'filters' => [
                'status' => $status,
                'team' => null, // Removed team filter
                'search' => $search,
            ],
            'user_role' => $user->role,
            'user_teams' => $user->teams, // Changed from user_team to user_teams
            'primary_team' => $user->primaryTeam(),
            'available_teams' => $teams,
            'can_create' => $user->isAdmin(),
            'can_manage_projects' => $user->isAdmin(),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        // Hanya admin yang bisa membuat project
        if (!$user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $users = User::where('is_active', true)->get(['id', 'name', 'email', 'team_id']);
        $teams = Team::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('projects/create', [
            'users' => $users,
            'teams' => $teams,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // Hanya admin yang bisa membuat project
        if (!$user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        // Debug: log semua data yang diterima
        Log::info('Project creation data received:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:planning,in_progress,completed,on_hold',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'required|exists:users,id',
            'team_id' => 'required|exists:teams,id',
            'opd_owner' => 'nullable|string|max:255',
            'document_files' => 'nullable|array',
            'document_files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // max 10MB
            'assigned_users' => 'array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        // Debug: log assigned users
        Log::info('Assigned users to sync:', $assignedUsers);

        $project = Project::create($validated);

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            foreach ($files as $file) {
                $fileName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
                
                \App\Models\ProjectDocument::create([
                    'project_id' => $project->id,
                    'file_name' => $fileName,
                    'file_path' => $path,
                ]);
            }
        } elseif ($request->hasFile('document_file')) {
            $file = $request->file('document_file');
            $fileName = $file->getClientOriginalName();
            $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
            
            \App\Models\ProjectDocument::create([
                'project_id' => $project->id,
                'file_name' => $fileName,
                'file_path' => $path,
            ]);
        }

        // Sync assigned users
        $project->assignedUsers()->sync($assignedUsers);

        // Update assigned_staff JSON for mobile app compatibility
        $project->update([
            'assigned_staff' => json_encode(\App\Models\User::whereIn('id', $assignedUsers)->pluck('name')->toArray())
        ]);

        // Debug: log relasi setelah sync
        Log::info('Project assigned users after sync:', $project->assignedUsers->pluck('id')->toArray());

        return redirect()->route('dashboard.projects.index')->with('success', 'Project created successfully!');
    }

    public function update(Request $request, Project $project)
    {
        $user = auth()->user();

        // Cek permission: admin only
        if (!$user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:planning,in_progress,completed,on_hold',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'required|exists:users,id',
            'team_id' => $user->isAdmin() ? 'required|exists:teams,id' : 'sometimes',
            'opd_owner' => 'nullable|string|max:255',
            'document_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'assigned_users' => 'array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            foreach ($files as $file) {
                $fileName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
                
                \App\Models\ProjectDocument::create([
                    'project_id' => $project->id,
                    'file_name' => $fileName,
                    'file_path' => $path,
                ]);
            }
        } elseif ($request->hasFile('document_file')) {
            $file = $request->file('document_file');
            $fileName = $file->getClientOriginalName();
            $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
            
            \App\Models\ProjectDocument::create([
                'project_id' => $project->id,
                'file_name' => $fileName,
                'file_path' => $path,
            ]);
        }

        // Non-admin tidak bisa mengubah team
        if (!$user->isAdmin()) {
            unset($validated['team_id']);
        }

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        // Debug: log assigned users for update
        Log::info('Update - Assigned users to sync:', $assignedUsers);

        $project->update($validated);

        // Sync assigned users
        $project->assignedUsers()->sync($assignedUsers);

        // Update assigned_staff JSON for mobile app compatibility
        $project->update([
            'assigned_staff' => json_encode(\App\Models\User::whereIn('id', $assignedUsers)->pluck('name')->toArray())
        ]);

        // Debug: log relasi setelah sync
        Log::info('Update - Project assigned users after sync:', $project->assignedUsers->pluck('id')->toArray());

        return redirect()->back()->with('success', 'Project updated successfully!');
    }

    public function destroy(Project $project)
    {
        $user = auth()->user();

        // Hanya admin yang bisa menghapus project
        if (!$user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $project->delete();

        return redirect()->back()->with('success', 'Project deleted successfully!');
    }

    public function show(Project $project)
    {
        $user = auth()->user();
        $user->load('teams');

        // Load relasi dulu agar bisa mengecek assignedUsers
        $project->load(['user', 'team', 'assignedUsers', 'tasks.assignedUser', 'bugs', 'reports.user', 'documents', 'milestones.tasks']);
        $project->recalculateProgress();

        // Cek akses: admin, owner, assigned user, atau anggota team project
        $isOwner = $project->user_id === $user->id;
        $isAssigned = $project->assignedUsers->contains('id', $user->id);
        $isInTeam = $user->belongsToTeam($project->team_id);

        if (!$user->isAdmin() && !$isOwner && !$isAssigned && !$isInTeam) {
            abort(403, 'Unauthorized action.');
        }

        // Get users untuk task assignment (dari team yang sama atau teams yang diikuti user)
        $usersQuery = User::select('id', 'name', 'email')->where('is_active', true);

        if ($user->isAdmin()) {
            // Admin bisa assign siapa saja dari team project
            $usersQuery->whereHas('teams', function($query) use ($project) {
                $query->where('teams.id', $project->team_id);
            });
        } else {
            // User biasa hanya bisa assign dari teams yang dia ikuti
            $userTeamIds = $user->teams->pluck('id')->toArray();
            $usersQuery->whereHas('teams', function($query) use ($userTeamIds) {
                $query->whereIn('teams.id', $userTeamIds);
            });
        }

        $users = $usersQuery->get();

        return Inertia::render('projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'due_date' => $project->due_date?->format('Y-m-d'),
                'user' => $project->user,
                'team' => $project->team,
                'documents' => $project->documents->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->file_name,
                        'url' => $doc->document_url,
                    ];
                }),
                'milestones' => $project->milestones->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'title' => $m->title,
                        'description' => $m->description,
                        'due_date' => $m->due_date?->format('Y-m-d'),
                        'status' => $m->status,
                        'progress_percentage' => $m->progress_percentage,
                        'completed_tasks_count' => $m->completed_tasks_count,
                        'total_tasks_count' => $m->total_tasks_count,
                    ];
                }),
                'assigned_users' => $project->assignedUsers,
                'tasks' => $project->tasks->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'status' => $task->status,
                        'priority' => $task->priority,
                        'due_date' => $task->due_date?->format('Y-m-d'),
                        'assigned_user' => $task->assignedUser,
                        'image_url' => $task->image_url,
                        'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'bugs' => $project->bugs->map(function ($bug) {
                    return [
                        'id' => $bug->id,
                        'title' => $bug->title,
                        'description' => $bug->description,
                        'severity' => $bug->severity,
                        'status' => $bug->status,
                        'created_at' => $bug->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'reports' => $project->reports->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'file_name' => $report->file_name,
                        'file_url' => asset('storage/' . $report->file_path),
                        'type' => $report->type,
                        'description' => $report->description,
                        'user' => $report->user,
                        'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'progress_percentage' => $project->progress_percentage,
                'progress' => $project->progress ?? 0,
                'completed_tasks_count' => $project->completed_tasks_count,
                'total_tasks_count' => $project->total_tasks_count,
                'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                'can_edit' => $user->isAdmin(),
                'can_delete' => $user->isAdmin(),
            ],
            'users' => $users,
            'user_role' => $user->role,
        ]);
    }

    public function edit(Project $project)
    {
        $user = auth()->user();

        // Check permission: admin only
        if (!$user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $project->load(['assignedUsers', 'documents']);

        $users = User::where('is_active', true)->get(['id', 'name', 'email']);
        $teams = $user->isAdmin() ? Team::where('is_active', true)->get(['id', 'name']) : $user->teams;

        return Inertia::render('projects/edit', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'due_date' => $project->due_date?->format('Y-m-d'),
                'user_id' => $project->user_id,
                'team_id' => $project->team_id,
                'opd_owner' => $project->opd_owner,
                'documents' => $project->documents->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->file_name,
                        'url' => $doc->document_url,
                    ];
                }),
                'assigned_users' => $project->assignedUsers->pluck('id')->toArray(),
            ],
            'users' => $users,
            'teams' => $teams,
            'can_change_team' => $user->isAdmin(),
        ]);
    }

    public function uploadDocuments(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $request->validate([
            'document_files' => 'required|array',
            'document_files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            foreach ($files as $file) {
                $fileName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
                
                \App\Models\ProjectDocument::create([
                    'project_id' => $project->id,
                    'file_name' => $fileName,
                    'file_path' => $path,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Documents uploaded successfully.',
        ], 201);
    }

    public function deleteDocument($projectId, $documentId)
    {
        $document = \App\Models\ProjectDocument::where('project_id', $projectId)
            ->findOrFail($documentId);

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Document deleted successfully.',
        ]);
    }
}
