<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of teams
     */
    public function index(): Response
    {
        $teams = Team::withCount('users', 'projects')->get();

        return Inertia::render('teams/index', [
            'teams' => $teams,
            'can' => [
                'create_team' => auth()->user()->role === 'admin',
                'manage_teams' => auth()->user()->role === 'admin',
            ]
        ]);
    }

    /**
     * Show the form for creating a new team
     */
    public function create(): Response
    {
        $this->authorize('create', Team::class);

        return Inertia::render('teams/create');
    }

    /**
     * Store a newly created team
     */
    public function store(Request $request)
    {
        $this->authorize('create', Team::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:teams'],
            'description' => ['nullable', 'string', 'max:1000'],
            'plan' => ['required', 'in:internal,external'],
        ]);

        $team = Team::create($validated);

        return redirect()->route('dashboard.teams.index')
            ->with('success', 'Team created successfully.');
    }

    /**
     * Display the specified team
     */
    public function show(Team $team): Response
    {
        $team->load(['users', 'projects.tasks']);

        return Inertia::render('teams/show', [
            'team' => $team,
            'members' => $team->users()->with('projects')->get(),
            'projects' => $team->projects()->withCount('tasks')->get(),
            'can' => [
                'update_team' => auth()->user()->role === 'admin',
                'delete_team' => auth()->user()->role === 'admin',
                'manage_members' => auth()->user()->role === 'admin' || auth()->user()->team_id === $team->id,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified team
     */
    public function edit(Team $team): Response
    {
        $this->authorize('update', $team);

        return Inertia::render('teams/edit', [
            'team' => $team
        ]);
    }

    /**
     * Update the specified team
     */
    public function update(Request $request, Team $team)
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:teams,name,' . $team->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'plan' => ['required', 'in:internal,external'],
        ]);

        $team->update($validated);

        return redirect()->route('dashboard.teams.show', $team)
            ->with('success', 'Team updated successfully.');
    }

    /**
     * Remove the specified team
     */
    public function destroy(Team $team)
    {
        $this->authorize('delete', $team);

        if ($team->users()->count() > 0) {
            return back()->with('error', 'Cannot delete team with members. Please reassign members first.');
        }

        $team->delete();

        return redirect()->route('dashboard.teams.index')
            ->with('success', 'Team deleted successfully.');
    }

    /**
     * Show team members
     */
    public function members(Team $team): Response
    {
        $members = $team->users()
            ->with(['projects' => function($query) use ($team) {
                $query->where('team_id', $team->id);
            }])
            ->get();

        // Get all users available for assignment (not necessarily without teams since users can be in multiple teams)
        $availableUsers = User::where('is_active', true)
            ->whereNotExists(function ($query) use ($team) {
                $query->select('id')
                    ->from('team_user')
                    ->whereRaw('team_user.user_id = users.id')
                    ->where('team_user.team_id', $team->id);
            })
            ->get(['id', 'name', 'email']);

        return Inertia::render('teams/members', [
            'team' => $team,
            'members' => $members,
            'availableUsers' => $availableUsers,
            'can' => [
                'manage_members' => auth()->user()->role === 'admin' || auth()->user()->belongsToTeam($team->id),
                'add_members' => auth()->user()->role === 'admin',
                'remove_members' => auth()->user()->role === 'admin',
            ]
        ]);
    }

    /**
     * Add member to team
     */
    public function addMember(Request $request, Team $team)
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'in:member,leader,admin'],
            'is_primary' => ['boolean'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        // Check if user is already in this team
        if ($team->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is already a member of this team.');
        }

        // If this is set as primary team, unset other primary teams for this user
        if ($validated['is_primary'] ?? false) {
            $user->teams()->updateExistingPivot(
                $user->teams()->pluck('teams.id')->toArray(),
                ['is_primary' => false]
            );
        }

        // Attach user to team with role and primary status
        $team->users()->attach($user->id, [
            'role' => $validated['role'],
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return back()->with('success', 'Member added to team successfully.');
    }

    /**
     * Remove member from team
     */
    public function removeMember(Request $request, Team $team, User $user)
    {
        $this->authorize('update', $team);

        if (!$team->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is not a member of this team.');
        }

        $team->users()->detach($user->id);

        return back()->with('success', 'Member removed from team successfully.');
    }

    /**
     * Update member role in team
     */
    public function updateMemberRole(Request $request, Team $team, User $user)
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'role' => ['required', 'in:member,leader,admin'],
            'is_primary' => ['boolean'],
        ]);

        if (!$team->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is not a member of this team.');
        }

        // If this is set as primary team, unset other primary teams for this user
        if ($validated['is_primary'] ?? false) {
            $user->teams()->updateExistingPivot(
                $user->teams()->pluck('teams.id')->toArray(),
                ['is_primary' => false]
            );
        }

        $team->users()->updateExistingPivot($user->id, [
            'role' => $validated['role'],
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return back()->with('success', 'Member role updated successfully.');
    }
}
