<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemNotification;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $this->checkApproachingDeadlines();

        $notifications = SystemNotification::orderBy('created_at', 'desc')->get()->map(function ($notif) {
            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'desc' => $notif->description ?? '',
                'time' => $notif->time_ago,
                'type' => $notif->type,
                'color' => $notif->color,
                'isRead' => (bool)$notif->is_read,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'notifications' => $notifications
            ]
        ]);
    }

    public function readAll(): JsonResponse
    {
        SystemNotification::where('is_read', false)->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Semua notifikasi ditandai telah dibaca!'
        ]);
    }

    protected function checkApproachingDeadlines()
    {
        $projects = Project::with('divisi')->get();
        $now = Carbon::now()->startOfDay();

        foreach ($projects as $proj) {
            $targetDateStr = $proj->target_date;
            $targetDate = $this->parseTargetDate($targetDateStr);

            if (!$targetDate) {
                continue;
            }

            $targetDate = $targetDate->startOfDay();
            $diffInDays = $now->diffInDays($targetDate, false);

            // 1. Threshold 7 Days (1 Week)
            if ($diffInDays > 3 && $diffInDays <= 7) {
                $title = "Tenggat Waktu: {$proj->name} Tersisa 1 Minggu!";
                $exists = SystemNotification::where('title', $title)->exists();
                if (!$exists) {
                    SystemNotification::create([
                        'title' => $title,
                        'description' => "Proyek {$proj->name} (Divisi: {$proj->divisi->nama}) mendekati tenggat waktu pada {$targetDateStr} (Tersisa {$diffInDays} hari lagi).",
                        'time_ago' => 'Baru saja',
                        'type' => 'warning',
                        'color' => '#F59E0B', // Amber
                        'is_read' => false
                    ]);
                }
            }

            // 2. Threshold 3 Days or less
            if ($diffInDays >= 0 && $diffInDays <= 3) {
                $title = "Tenggat Waktu: {$proj->name} Tersisa 3 Hari!";
                $exists = SystemNotification::where('title', $title)->exists();
                if (!$exists) {
                    SystemNotification::create([
                        'title' => $title,
                        'description' => "Kritis: Proyek {$proj->name} (Divisi: {$proj->divisi->nama}) mendekati tenggat waktu pada {$targetDateStr} (Tersisa {$diffInDays} hari lagi).",
                        'time_ago' => 'Baru saja',
                        'type' => 'error',
                        'color' => '#EF4444', // Red
                        'is_read' => false
                    ]);
                }
            }
        }
    }

    protected function parseTargetDate($dateStr)
    {
        try {
            $replacements = [
                'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'Mei' => 'May', 'Jun' => 'Jun',
                'Jul' => 'Jul', 'Agu' => 'Aug', 'Sep' => 'Sep', 'Okt' => 'Oct', 'Nov' => 'Nov', 'Des' => 'Dec',
                'Januari' => 'January', 'Februari' => 'February', 'Maret' => 'March', 'April' => 'April',
                'Mei' => 'May', 'Juni' => 'June', 'Juli' => 'July', 'Agustus' => 'August',
                'September' => 'September', 'Oktober' => 'October', 'November' => 'November', 'Desember' => 'December'
            ];
            
            $normalized = str_replace(array_keys($replacements), array_values($replacements), $dateStr);
            return Carbon::parse($normalized);
        } catch (\Exception $e) {
            return null;
        }
    }
}
