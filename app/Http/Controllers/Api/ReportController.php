<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function index(): JsonResponse
    {
        // 1. Calculate real-time metrics from the database
        $averageReliability = Anggota::avg('reliability') ?? 0.0;
        $globalEfficiency = number_format($averageReliability, 1) . '%';

        $averageWorkloadVal = Anggota::avg('workload_percentage') ?? 0.0;
        $averageWorkload = number_format($averageWorkloadVal, 1) . '%';

        // 2. Fetch reports dynamically from the project_reports database table
        $dbReports = \App\Models\ProjectReport::latest()->get()->map(function ($report) {
            $ext = strtolower(pathinfo($report->file_name, PATHINFO_EXTENSION));
            if (empty($ext)) {
                $ext = strtolower($report->type);
            }

            // Map extension to SAKIP/PKPT/Evaluasi/Perencanaan/Regulasi to match category colors in Flutter
            $category = 'Evaluasi';
            if (in_array($ext, ['pdf'])) {
                $category = 'SAKIP';
            } elseif (in_array($ext, ['xls', 'xlsx', 'csv'])) {
                $category = 'PKPT';
            } elseif (in_array($ext, ['doc', 'docx'])) {
                $category = 'Regulasi';
            } elseif (in_array($ext, ['ppt', 'pptx'])) {
                $category = 'Perencanaan';
            }

            // Calculate file size from Storage
            $sizeStr = '0.1 MB';
            try {
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($report->file_path)) {
                    $sizeBytes = \Illuminate\Support\Facades\Storage::disk('public')->size($report->file_path);
                    if ($sizeBytes > 1024 * 1024) {
                        $sizeStr = number_format($sizeBytes / (1024 * 1024), 1) . ' MB';
                    } elseif ($sizeBytes > 1024) {
                        $sizeStr = number_format($sizeBytes / 1024, 0) . ' KB';
                    } else {
                        $sizeStr = $sizeBytes . ' B';
                    }
                }
            } catch (\Exception $e) {
                // Keep default size
            }

            return [
                'title' => $report->file_name,
                'category' => $category,
                'size' => $sizeStr,
                'date' => $report->created_at->format('d M Y'),
                'description' => $report->description,
                'url' => '/storage/' . $report->file_path,
            ];
        })->toArray();

        // Fallback to default dummy reports if no uploads exist in database
        if (empty($dbReports)) {
            $reports = [
                [
                    'title' => 'Laporan Kinerja Instansi Pemerintah (LKIP) 2025',
                    'category' => 'SAKIP',
                    'size' => '4.2 MB',
                    'date' => '12 Feb 2026',
                    'description' => 'Laporan Akuntabilitas Kinerja Instansi Pemerintah Dinas Kominfo.',
                    'url' => '#',
                ],
                [
                    'title' => 'Program Kerja Pengawasan Tahunan (PKPT) 2026',
                    'category' => 'PKPT',
                    'size' => '2.8 MB',
                    'date' => '20 Jan 2026',
                    'description' => 'Rencana pengawasan internal inspektorat sepanjang tahun 2026.',
                    'url' => '#',
                ],
                [
                    'title' => 'Hasil Evaluasi SAKIP Internal Kabupaten',
                    'category' => 'Evaluasi',
                    'size' => '1.5 MB',
                    'date' => '05 Jan 2026',
                    'description' => 'Evaluasi mandiri atas implementasi sistem akuntabilitas kinerja.',
                    'url' => '#',
                ],
                [
                    'title' => 'Rencana Perencanaan Kinerja Tahunan (RKT) 2026',
                    'category' => 'Perencanaan',
                    'size' => '3.1 MB',
                    'date' => '15 Des 2025',
                    'description' => 'Target and sasaran program kerja tahunan daerah.',
                    'url' => '#',
                ],
                [
                    'title' => 'Kompilasi Kebijakan & Regulasi Inspektorat',
                    'category' => 'Regulasi',
                    'size' => '5.6 MB',
                    'date' => '01 Des 2025',
                    'description' => 'Daftar regulasi, undang-undang, dan SOP pengawasan.',
                    'url' => '#',
                ],
            ];
        } else {
            $reports = $dbReports;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'globalEfficiency' => $globalEfficiency,
                    'averageWorkload' => $averageWorkload,
                ],
                'reports' => $reports
            ]
        ]);
    }
}
