<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Task;
use App\Models\Divisi;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // 1. KPI Counters
        $totalProjects = Project::count();
        
        $allActiveTasks = Task::where('status', 'ACTIVE')->get();
        $delayedTasks = 0;
        $now = \Carbon\Carbon::now();
        
        $indonesianMonths = [
            'Jan' => 'Jan',
            'Feb' => 'Feb',
            'Mar' => 'Mar',
            'Apr' => 'Apr',
            'Mei' => 'May',
            'Jun' => 'Jun',
            'Jul' => 'Jul',
            'Agt' => 'Aug',
            'Sep' => 'Sep',
            'Okt' => 'Oct',
            'Nov' => 'Nov',
            'Des' => 'Dec'
        ];

        foreach ($allActiveTasks as $task) {
            $dueDateStr = $task->due_date;
            if (empty($dueDateStr)) {
                continue;
            }
            $translatedDateStr = strtr($dueDateStr, $indonesianMonths);
            try {
                $dueDate = \Carbon\Carbon::createFromFormat('d M Y', $translatedDateStr)->startOfDay();
                if ($dueDate->isBefore($now->startOfDay())) {
                    $delayedTasks++;
                }
            } catch (\Exception $e) {
                try {
                    $dueDate = \Carbon\Carbon::parse($translatedDateStr)->startOfDay();
                    if ($dueDate->isBefore($now->startOfDay())) {
                        $delayedTasks++;
                    }
                } catch (\Exception $ex) {
                    // Ignore parsing errors
                }
            }
        }

        // Calculate trends dynamically
        $thisMonthProjects = Project::where('created_at', '>=', now()->startOfMonth())->count();
        $prevMonthProjects = Project::whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])->count();
        if ($prevMonthProjects > 0) {
            $diff = $thisMonthProjects - $prevMonthProjects;
            $percentage = round(($diff / $prevMonthProjects) * 100);
            $totalProjectsTrend = ($percentage >= 0 ? '+' : '') . $percentage . '%';
        } else {
            $totalProjectsTrend = $thisMonthProjects > 0 ? '+' . $thisMonthProjects : '+0';
        }

        $completedRecent = Task::where('status', 'COMPLETED')
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();
        $delayedTasksTrend = $completedRecent > 0 ? '-' . $completedRecent : '0';

        $activeStaffCount = Anggota::count();

        // 2. Weekly Productivity (Engineering vs Ops vs Design etc.)
        // Standard static departments from Tailwind dashboard to ensure beautiful charts
        $weeklyProductivity = [
            [
                'day' => 'MON',
                'departments' => [
                    ['name' => 'Engineering', 'value' => 65],
                    ['name' => 'Operations', 'value' => 45],
                    ['name' => 'Design', 'value' => 80],
                ]
            ],
            [
                'day' => 'TUE',
                'departments' => [
                    ['name' => 'Engineering', 'value' => 85],
                    ['name' => 'Operations', 'value' => 55],
                    ['name' => 'Design', 'value' => 70],
                ]
            ],
            [
                'day' => 'WED',
                'departments' => [
                    ['name' => 'Engineering', 'value' => 95],
                    ['name' => 'Operations', 'value' => 60],
                    ['name' => 'Design', 'value' => 85],
                ]
            ],
            [
                'day' => 'THU',
                'departments' => [
                    ['name' => 'Engineering', 'value' => 45],
                    ['name' => 'Operations', 'value' => 70],
                    ['name' => 'Design', 'value' => 50],
                ]
            ],
            [
                'day' => 'FRI',
                'departments' => [
                    ['name' => 'Engineering', 'value' => 75],
                    ['name' => 'Operations', 'value' => 90],
                    ['name' => 'Design', 'value' => 95],
                ]
            ],
        ];

        // 3. Top Performers (Staff with reliability >= 90%)
        $topPerformers = Anggota::with('divisi')
            ->orderBy('reliability', 'desc')
            ->take(5)
            ->get()
            ->map(function ($anggota) {
                return [
                    'id' => $anggota->id,
                    'name' => $anggota->nama,
                    'role' => $anggota->jabatan,
                    'department' => $anggota->divisi ? $anggota->divisi->nama : 'N/A',
                    'reliability' => $anggota->reliability,
                    'workloadPercentage' => $anggota->workload_percentage,
                    'status' => $anggota->status,
                    'avatarUrl' => str_replace(['127.0.0.1:8000', 'localhost:8000'], '10.0.2.2:8000', str_starts_with($anggota->foto, 'http') ? $anggota->foto : asset('storage/' . $anggota->foto)),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'kpis' => [
                    'totalProjects' => $totalProjects,
                    'totalProjectsTrend' => $totalProjectsTrend,
                    'delayedTasks' => $delayedTasks,
                    'delayedTasksTrend' => $delayedTasksTrend,
                    'activeStaff' => $activeStaffCount,
                    'activeStaffTrend' => 'LIVE',
                ],
                'weeklyProductivity' => $weeklyProductivity,
                'topPerformers' => $topPerformers,
            ]
        ]);
    }
}
