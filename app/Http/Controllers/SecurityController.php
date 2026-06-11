<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SecurityController extends Controller
{
    /**
     * Display security settings
     */
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('settings/security/index', [
            'user' => $user,
            'sessions' => $this->getActiveSessions(),
            'can' => [
                'manage_security' => $user->role === 'admin',
            ]
        ]);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        auth()->user()->update([
            'password' => Hash::make($validated['password'])
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Enable/disable two-factor authentication
     */
    public function updateTwoFactor(Request $request)
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        auth()->user()->update([
            'two_factor_enabled' => $validated['enabled']
        ]);

        $message = $validated['enabled']
            ? 'Two-factor authentication enabled successfully.'
            : 'Two-factor authentication disabled successfully.';

        return back()->with('success', $message);
    }

    /**
     * Get active sessions (mock data for now)
     */
    private function getActiveSessions()
    {
        return [
            [
                'id' => 1,
                'device' => 'Chrome on Windows',
                'ip_address' => request()->ip(),
                'last_active' => now(),
                'current' => true,
            ]
        ];
    }

    /**
     * Revoke session
     */
    public function revokeSession(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        // Logic to revoke session would go here
        // For now, just return success

        return back()->with('success', 'Session revoked successfully.');
    }
}
