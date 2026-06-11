<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserController;

// Dashboard endpoints
Route::get('/dashboard', [DashboardController::class, 'index']);

// Staff/Anggota endpoints
Route::get('/staff', [StaffController::class, 'index']);
Route::post('/staff', [StaffController::class, 'store']);
Route::get('/staff/{id}', [StaffController::class, 'show']);
Route::match(['post', 'put', 'patch'], '/staff/{id}', [StaffController::class, 'update']);
Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
Route::post('/staff/{id}/task', [StaffController::class, 'assignTask']);
Route::post('/staff/{id}/feedback', [StaffController::class, 'submitFeedback']);
Route::get('/divisions', [StaffController::class, 'getDivisions']);

// Projects endpoints
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::post('/projects/{id}', [ProjectController::class, 'update']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

// Reports endpoints
Route::get('/reports', [ReportController::class, 'index']);

// System Notifications endpoints
Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);

// Profile & User endpoints
Route::get('/profile', [UserController::class, 'profile']);
Route::post('/profile', [UserController::class, 'update']);
Route::post('/profile/avatar', [UserController::class, 'updateAvatar']);
Route::post('/profile/reset-password', [UserController::class, 'resetPassword']);

Route::get('/image/progress_logs/{filename}', function ($filename) {
    $path = storage_path('app/public/progress_logs/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
});
