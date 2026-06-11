<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get the default user profile.
     */
    public function profile(): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatarUrl' => $user->profile_image ? (str_starts_with($user->profile_image, 'http') ? $user->profile_image : asset('storage/' . $user->profile_image)) : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&format=png',
            ]
        ]);
    }

    /**
     * Update user profile information.
     */
    public function update(Request $request): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui!',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatarUrl' => $user->profile_image ? (str_starts_with($user->profile_image, 'http') ? $user->profile_image : asset('storage/' . $user->profile_image)) : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&format=png',
            ]
        ]);
    }

    /**
     * Update user avatar URL.
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'avatarUrl' => 'required|string',
        ]);

        $user->update([
            'profile_image' => $request->avatarUrl,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Foto profil berhasil diperbarui!',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatarUrl' => $user->profile_image ? (str_starts_with($user->profile_image, 'http') ? $user->profile_image : asset('storage/' . $user->profile_image)) : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&format=png',
            ]
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:8',
        ]);

        // Verify current password
        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi saat ini tidak cocok!'
            ], 422);
        }

        $user->update([
            'password' => $request->newPassword,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui!'
        ]);
    }
}
