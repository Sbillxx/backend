<?php

namespace App\Http\Middleware;

use App\Http\Controllers\TeamSwitchController;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShareTeamData
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $user = auth()->user();
            $user->load('teams');

            // Get active team from session
            $activeTeam = TeamSwitchController::getActiveTeam();

            // Get available teams
            $availableTeams = [];
            if ($user->isAdmin()) {
                $availableTeams = \App\Models\Team::where('is_active', true)->get();
            } else {
                $availableTeams = $user->teams;
            }

            // Share team data with all Inertia responses
            Inertia::share([
                'active_team' => $activeTeam,
                'available_teams' => $availableTeams,
                'user_teams' => $user->teams,
                'user_role' => $user->role,
            ]);
        }

        return $next($request);
    }
}
