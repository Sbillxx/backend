<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class TeamSwitchController extends Controller
{
    /**
     * Switch user's active team
     */
    public function switchTeam(Request $request)
    {
        $user = auth()->user();
        $teamId = $request->input('team_id');

        if ($teamId) {
            // Validate that user belongs to this team
            $team = Team::findOrFail($teamId);

            if (!$user->belongsToTeam($teamId)) {
                return back()->with('error', 'You do not belong to this team.');
            }

            // Store active team in session
            Session::put('active_team_id', $teamId);
            Session::put('active_team', $team);
        } else {
            // Clear active team
            Session::forget('active_team_id');
            Session::forget('active_team');
        }

        // Redirect to dashboard to refresh with new team context
        return redirect()->route('dashboard')->with('success', 'Team switched successfully.');
    }

    /**
     * Get current active team from session
     */
    public static function getActiveTeam()
    {
        $teamId = Session::get('active_team_id');
        if ($teamId) {
            return Team::find($teamId);
        }
        return null;
    }

    /**
     * Get team-specific dashboard data
     */
    public function getTeamDashboard(Request $request)
    {
        $user = auth()->user();
        $activeTeam = self::getActiveTeam();

        $data = [
            'user' => $user,
            'active_team' => $activeTeam,
            'teams' => $user->teams,
        ];

        if ($activeTeam) {
            // Get team-specific data
            $data['team_projects'] = $activeTeam->projects()
                ->withCount('tasks')
                ->with(['user', 'assignedUsers'])
                ->latest()
                ->take(5)
                ->get();

            $data['team_members'] = $activeTeam->users()
                ->where('is_active', true)
                ->get();

            $data['team_stats'] = [
                'total_projects' => $activeTeam->projects()->count(),
                'active_projects' => $activeTeam->projects()->where('status', 'in_progress')->count(),
                'completed_projects' => $activeTeam->projects()->where('status', 'completed')->count(),
                'total_members' => $activeTeam->users()->count(),
            ];
        } else {
            // Get user's personal data when no team is selected
            $data['user_projects'] = $user->projects()
                ->withCount('tasks')
                ->with(['team', 'assignedUsers'])
                ->latest()
                ->take(5)
                ->get();

            $data['user_stats'] = [
                'total_projects' => $user->projects()->count(),
                'active_projects' => $user->projects()->where('status', 'in_progress')->count(),
                'completed_projects' => $user->projects()->where('status', 'completed')->count(),
                'total_teams' => $user->teams()->count(),
            ];
        }

        return $data;
    }
}
