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

        // 2. Standard report document list to match reports_tab.dart
        $reports = [
            [
                'title' => 'Laporan Kinerja Instansi Pemerintah (LKIP) 2025',
                'category' => 'SAKIP',
                'size' => '4.2 MB',
                'date' => '12 Feb 2026',
            ],
            [
                'title' => 'Program Kerja Pengawasan Tahunan (PKPT) 2026',
                'category' => 'PKPT',
                'size' => '2.8 MB',
                'date' => '20 Jan 2026',
            ],
            [
                'title' => 'Hasil Evaluasi SAKIP Internal Kabupaten',
                'category' => 'Evaluasi',
                'size' => '1.5 MB',
                'date' => '05 Jan 2026',
            ],
            [
                'title' => 'Rencana Perencanaan Kinerja Tahunan (RKT) 2026',
                'category' => 'Perencanaan',
                'size' => '3.1 MB',
                'date' => '15 Des 2025',
            ],
            [
                'title' => 'Kompilasi Kebijakan & Regulasi Inspektorat',
                'category' => 'Regulasi',
                'size' => '5.6 MB',
                'date' => '01 Des 2025',
            ],
        ];

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
