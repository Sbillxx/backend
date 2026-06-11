<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of users
     */
    public function index(): Response
    {
        $users = User::with('teams')
            ->when(request('search'), function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when(request('team') && request('team') !== 'all', function($query, $team) {
                $query->whereHas('teams', function($q) use ($team) {
                    $q->where('teams.id', $team);
                });
            })
            ->when(request('role') && request('role') !== 'all', function($query, $role) {
                $query->where('role', $role);
            })
            ->paginate(15);

        $teams = Team::all(['id', 'name']);

        return Inertia::render('users/index', [
            'users' => $users,
            'teams' => $teams,
            'filters' => request()->only(['search', 'team', 'role']),
            'can' => [
                'create_user' => auth()->user()?->isAdmin() ?? false,
                'manage_users' => auth()->user()?->isAdmin() ?? false,
            ]
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        $teams = Team::all(['id', 'name']);

        return Inertia::render('users/create', [
            'teams' => $teams
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:admin,user'],
            'team_id' => ['nullable', 'exists:teams,id'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return redirect()->route('dashboard.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user
     */
    public function show(User $user): Response
    {
        $user->load(['teams', 'projects.tasks']);

        return Inertia::render('users/show', [
            'user' => $user,
            'teams' => $user->teams,
            'primary_team' => $user->primaryTeam(),
            'projects' => $user->projects()->withCount('tasks')->get(),
            'can' => [
                'update_user' => auth()->user()?->isAdmin() ?? false,
                'delete_user' => (auth()->user()?->isAdmin() ?? false) && $user->id !== auth()->id(),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        $teams = Team::all(['id', 'name']);

        return Inertia::render('users/edit', [
            'user' => $user,
            'teams' => $teams
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:admin,user'],
            'team_id' => ['nullable', 'exists:teams,id'],
        ]);

        // Prevent user from changing their own role
        if ($user->id === auth()->id() && $validated['role'] !== $user->role) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $user->update($validated);

        return redirect()->route('dashboard.users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('dashboard.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
