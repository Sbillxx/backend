<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectTaskController;
use App\Http\Controllers\ProjectBugController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\HelpCenterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Apply ShareTeamData middleware to all dashboard routes
Route::middleware(['auth', 'share.team.data'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Evaluations
    Route::get('/evaluations', [App\Http\Controllers\EvaluationController::class, 'index'])->name('dashboard.evaluations');

    // Team Switching Routes
    Route::post('/switch-team', [App\Http\Controllers\TeamSwitchController::class, 'switchTeam'])->name('dashboard.switch-team');

    // Team Management Routes
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::resource('teams', TeamController::class)->names([
            'index' => 'dashboard.teams.index',
            'create' => 'dashboard.teams.create',
            'store' => 'dashboard.teams.store',
            'show' => 'dashboard.teams.show',
            'edit' => 'dashboard.teams.edit',
            'update' => 'dashboard.teams.update',
            'destroy' => 'dashboard.teams.destroy',
        ]);

    Route::get('/teams/{team}/members', [TeamController::class, 'members'])->name('dashboard.teams.members');
    Route::post('/teams/{team}/members', [TeamController::class, 'addMember'])->name('dashboard.teams.add-member');
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('dashboard.teams.remove-member');
    Route::patch('/teams/{team}/members/{user}', [TeamController::class, 'updateMemberRole'])->name('dashboard.teams.update-member-role');

        // User Management Routes
        Route::resource('users', UserController::class)->names([
            'index' => 'dashboard.users.index',
            'create' => 'dashboard.users.create',
            'store' => 'dashboard.users.store',
            'show' => 'dashboard.users.show',
            'edit' => 'dashboard.users.edit',
            'update' => 'dashboard.users.update',
            'destroy' => 'dashboard.users.destroy',
        ]);

        Route::patch('/users/{user}/password', [UserController::class, 'updatePassword'])->name('dashboard.users.update-password');
    });

    // Project Management Routes
    Route::resource('projects', ProjectController::class)->names([
        'index' => 'dashboard.projects.index',
        'create' => 'dashboard.projects.create',
        'store' => 'dashboard.projects.store',
        'show' => 'dashboard.projects.show',
        'edit' => 'dashboard.projects.edit',
        'update' => 'dashboard.projects.update',
        'destroy' => 'dashboard.projects.destroy',
    ]);

    Route::prefix('projects/{project}')->group(function () {
        Route::post('/tasks', [ProjectTaskController::class, 'store'])->name('dashboard.projects.tasks.store');
        Route::put('/tasks/{task}', [ProjectTaskController::class, 'update'])->name('dashboard.projects.tasks.update');
        Route::delete('/tasks/{task}', [ProjectTaskController::class, 'destroy'])->name('dashboard.projects.tasks.destroy');
        Route::patch('/tasks/{task}/status', [ProjectTaskController::class, 'updateStatus'])->name('dashboard.projects.tasks.updateStatus');

        // Bugs
        Route::post('/bugs', [ProjectBugController::class, 'store'])->name('dashboard.projects.bugs.store');
        Route::post('/bugs/{bug}/convert', [ProjectBugController::class, 'convertToTask'])->name('dashboard.projects.bugs.convert');
        Route::delete('/bugs/{bug}', [ProjectBugController::class, 'destroy'])->name('dashboard.projects.bugs.destroy');

        // Reports
        Route::post('/reports', [\App\Http\Controllers\ProjectReportController::class, 'store'])->name('dashboard.projects.reports.store');
        Route::delete('/reports/{report}', [\App\Http\Controllers\ProjectReportController::class, 'destroy'])->name('dashboard.projects.reports.destroy');
    });

    // Help Center Routes
    Route::prefix('help-center')->group(function () {
        Route::get('/', [HelpCenterController::class, 'index'])->name('dashboard.help-center');
        Route::get('/search', [HelpCenterController::class, 'search'])->name('dashboard.help-center.search');
        Route::get('/{slug}', [HelpCenterController::class, 'show'])->name('dashboard.help-center.article');
    });

    // Settings Routes
    Route::prefix('settings')->group(function () {
        Route::get('/', fn () => Inertia::render('settings/profile/index'))->name('dashboard.settings.index');
        Route::get('/account', fn () => Inertia::render('settings/account/index'))->name('dashboard.settings.account');
        Route::patch('/profile', [ProfileController::class, 'updateSettingsProfile'])->name('dashboard.settings.profile.update');
        Route::patch('/account', [ProfileController::class, 'updateSettingsAccount'])->name('dashboard.settings.account.update');

        // Security Settings (Admin only)
        Route::get('/security', [SecurityController::class, 'index'])->name('dashboard.settings.security');
        Route::patch('/security/password', [SecurityController::class, 'updatePassword'])->name('dashboard.settings.security.password');
        Route::patch('/security/two-factor', [SecurityController::class, 'updateTwoFactor'])->name('dashboard.settings.security.two-factor');
        Route::delete('/security/sessions/{session}', [SecurityController::class, 'revokeSession'])->name('dashboard.settings.security.revoke-session');
    });

    // Other Dashboard Routes
    Route::get('/apps', fn () => Inertia::render('apps/index'))->name('dashboard.apps');
    Route::get('/chats', fn () => Inertia::render('chats/index'))->name('dashboard.chats');
    Route::get('/charts', fn () => Inertia::render('charts/index'))->name('dashboard.charts');
    Route::get('/mail', fn () => Inertia::render('mail/index'))->name('dashboard.mail');
    Route::get('/orders', fn () => Inertia::render('ecommerce/orders'))->name('dashboard.ecommerce.orders');
    Route::get('/products', fn () => Inertia::render('ecommerce/products'))->name('dashboard.ecommerce.products');
    Route::get('/products/edit', fn () => Inertia::render('ecommerce/product'))->name('dashboard.ecommerce.products.edit');
    Route::get('/tasks', fn () => Inertia::render('tasks/index'))->name('dashboard.tasks');
    Route::get('/chat-ai', fn () => Inertia::render('playground/dashboard-03'))->name('dashboard.03');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
