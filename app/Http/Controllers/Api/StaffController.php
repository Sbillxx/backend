<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Task;
use App\Models\Evaluation;
use App\Models\Divisi;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Anggota::with('divisi')->whereNotNull('user_id');

        // Filter by workload status
        if ($request->has('workload_status') && $request->workload_status !== 'ALL') {
            $query->where('status', $request->workload_status);
        }

        // Filter by division
        if ($request->has('division') && $request->division !== 'ALL') {
            $query->whereHas('divisi', function ($q) use ($request) {
                $q->where('nama', $request->division);
            });
        }

        // Search by name
        if ($request->has('search') && !empty($request->search)) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $staff = $query->orderBy('nama', 'asc')->get()->map(function ($anggota) {
            return [
                'id' => $anggota->id,
                'name' => $anggota->nama,
                'role' => $anggota->jabatan,
                'department' => $anggota->divisi->nama,
                'workloadPercentage' => $anggota->workload_percentage,
                'status' => $anggota->status,
                'totalTasks' => $anggota->total_tasks,
                'avatarUrl' => str_replace(['127.0.0.1:8000', 'localhost:8000'], '10.0.2.2:8000', str_starts_with($anggota->foto, 'http') ? $anggota->foto : asset('storage/' . $anggota->foto)),
            ];
        });

        // Also return the list of divisions for the filters
        $divisions = Divisi::pluck('nama')->toArray();

        return response()->json([
            'status' => 'success',
            'data' => [
                'staff' => $staff,
                'divisions' => array_merge(['ALL'], $divisions)
            ]
        ]);
    }

    public function show($id): JsonResponse
    {
        $anggota = Anggota::with(['divisi', 'tasks', 'evaluations'])->find($id);

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota tidak ditemukan'
            ], 404);
        }

        $activeTasksFromDb = $anggota->tasks()->where('status', 'ACTIVE')->orderBy('created_at', 'desc')->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description ?? '',
                'dueDate' => $task->due_date,
                'status' => $task->status,
                'progress' => 0.0, // Personal tasks start at 0%
            ];
        });

        $activeProjects = \App\Models\Project::where('assigned_staff', 'like', '%"'.$anggota->nama.'"%')
            ->where('progress', '<', 100)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($proj) {
                return [
                    'id' => $proj->id + 10000, // Offset to avoid ID collision
                    'title' => $proj->name,
                    'description' => 'Proyek: ' . ($proj->description ?? ''),
                    'dueDate' => $proj->target_date ?? 'Belum ditentukan',
                    'status' => 'ACTIVE',
                    'progress' => $proj->progress / 100, // Pass actual progress
                ];
            });

        $activeTasks = $activeProjects->merge($activeTasksFromDb);

        $completedTasks = $anggota->tasks()->where('status', 'COMPLETED')->orderBy('updated_at', 'desc')->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description ?? '',
                'dueDate' => $task->due_date,
                'status' => $task->status,
            ];
        });

        $evaluations = $anggota->evaluations()->orderBy('created_at', 'desc')->get()->map(function ($eval) {
            return [
                'id' => $eval->id,
                'note' => $eval->note,
                'date' => $eval->date,
                'rating' => $eval->rating,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $anggota->id,
                'name' => $anggota->nama,
                'role' => $anggota->jabatan,
                'department' => $anggota->divisi->nama,
                'workloadPercentage' => $anggota->workload_percentage,
                'status' => $anggota->status,
                'reliability' => $anggota->reliability,
                'weeklyOutput' => $anggota->weekly_output,
                'avatarUrl' => str_replace(['127.0.0.1:8000', 'localhost:8000'], '10.0.2.2:8000', str_starts_with($anggota->foto, 'http') ? $anggota->foto : asset('storage/' . $anggota->foto)),
                'activeTasks' => $activeTasks,
                'completedTasks' => $completedTasks,
                'evaluations' => $evaluations,
            ]
        ]);
    }

    public function assignTask(Request $request, $id): JsonResponse
    {
        $anggota = Anggota::find($id);

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'dueDate' => 'required|string',
        ]);

        $task = Task::create([
            'anggota_id' => $anggota->id,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->dueDate,
            'status' => 'ACTIVE'
        ]);

        // Create dynamic system notification
        SystemNotification::create([
            'title' => 'Tugas Baru: ' . $task->title . ' ditugaskan ke ' . $anggota->nama,
            'description' => 'Deskripsi: ' . ($task->description ?? 'Tidak ada deskripsi'),
            'time_ago' => 'Baru saja',
            'type' => 'task',
            'color' => '#10B981', // green
            'is_read' => false
        ]);

        // Recalculate tasks and status
        $anggota->total_tasks = $anggota->tasks()->count();
        $anggota->active_tasks_count = $anggota->tasks()->where('status', 'ACTIVE')->count();
        $anggota->recalculateWorkload();

        return response()->json([
            'status' => 'success',
            'message' => 'Tugas baru berhasil ditugaskan!',
            'data' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description ?? '',
                'dueDate' => $task->due_date,
                'status' => $task->status,
            ]
        ]);
    }

    public function submitFeedback(Request $request, $id): JsonResponse
    {
        $anggota = Anggota::find($id);

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'note' => 'required|string',
            'rating' => 'required|numeric|min:1|max:5',
        ]);

        $eval = Evaluation::create([
            'anggota_id' => $anggota->id,
            'note' => $request->note,
            'date' => now()->format('d M Y'),
            'rating' => $request->rating,
        ]);

        // Create dynamic system notification for feedback
        SystemNotification::create([
            'title' => 'Umpan Balik: Evaluasi Baru untuk ' . $anggota->nama,
            'description' => 'Catatan: ' . $eval->note . ' (Rating: ' . $eval->rating . ' ★)',
            'time_ago' => 'Baru saja',
            'type' => 'info',
            'color' => '#3B82F6', // blue
            'is_read' => false
        ]);

        // Dynamically calculate average reliability based on evaluation ratings
        $averageRating = $anggota->evaluations()->avg('rating');
        if ($averageRating > 0) {
            $anggota->reliability = min(100.0, round(($averageRating / 5.0) * 100, 1));
        }
        $anggota->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Feedback berhasil dikirim!',
            'data' => [
                'id' => $eval->id,
                'note' => $eval->note,
                'date' => $eval->date,
                'rating' => $eval->rating,
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'divisi_id' => 'required|exists:divisis,id',
            'foto' => 'nullable|string',
            'reliability' => 'nullable|numeric|min:0|max:100',
            'weekly_output' => 'nullable|integer|min:0',
        ]);

        $anggota = Anggota::create([
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'divisi_id' => $request->divisi_id,
            'foto' => $request->foto ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjPYthawamKptO2svXYC5fv264uFWWqQl9In0-GIhvdJMYbhV91YV9oAn2yg7r43B96sIFx5ecN_i4KNfN2pysyEnFB3xtlQ8-fQLACG6d-HN-MC_1CZkmrqyplTuoFpHs2qIu4ZyYphrM8yyKitoUygP9PlXww_CrNTgeIqyjop4D1BP74xVjeeWioLaIC1vtzYb7yHgXD5LuDqTH00v1sHmVKNKIYYwjyZtXmz-3munyX0ZhkPP5KF1IoscqtqdI7EGTUN1IlIyy',
            'status' => 'NORMAL',
            'workload_percentage' => 0,
            'total_tasks' => 0,
            'active_tasks_count' => 0,
            'reliability' => $request->reliability ?? 95.0,
            'weekly_output' => $request->weekly_output ?? 0,
        ]);

        $anggota->load('divisi');

        // Create System Notification
        SystemNotification::create([
            'title' => 'Staf Baru: ' . $anggota->nama,
            'description' => 'Telah bergabung sebagai ' . $anggota->jabatan . ' di Divisi ' . $anggota->divisi->nama . '!',
            'time_ago' => 'Baru saja',
            'type' => 'info',
            'color' => '#10B981', // green
            'is_read' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Anggota staf baru berhasil ditambahkan!',
            'data' => [
                'id' => $anggota->id,
                'name' => $anggota->nama,
                'role' => $anggota->jabatan,
                'department' => $anggota->divisi->nama,
                'workloadPercentage' => $anggota->workload_percentage,
                'status' => $anggota->status,
                'totalTasks' => $anggota->total_tasks,
                'avatarUrl' => str_replace(['127.0.0.1:8000', 'localhost:8000'], '10.0.2.2:8000', str_starts_with($anggota->foto, 'http') ? $anggota->foto : asset('storage/' . $anggota->foto)),
            ]
        ], 210);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $anggota = Anggota::find($id);

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota staf tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'jabatan' => 'sometimes|required|string|max:255',
            'divisi_id' => 'sometimes|required|exists:divisis,id',
            'foto' => 'nullable|string',
            'reliability' => 'nullable|numeric|min:0|max:100',
            'weekly_output' => 'nullable|integer|min:0',
        ]);

        $anggota->update($request->only([
            'nama', 'jabatan', 'divisi_id', 'foto', 'reliability', 'weekly_output'
        ]));

        $anggota->load('divisi');
        $anggota->recalculateWorkload();

        // Create System Notification
        SystemNotification::create([
            'title' => 'Pembaruan Profil: ' . $anggota->nama,
            'description' => 'Informasi kepegawaian untuk ' . $anggota->nama . ' telah diperbarui.',
            'time_ago' => 'Baru saja',
            'type' => 'info',
            'color' => '#3B82F6', // blue
            'is_read' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data anggota staf berhasil diperbarui!',
            'data' => [
                'id' => $anggota->id,
                'name' => $anggota->nama,
                'role' => $anggota->jabatan,
                'department' => $anggota->divisi->nama,
                'workloadPercentage' => $anggota->workload_percentage,
                'status' => $anggota->status,
                'totalTasks' => $anggota->total_tasks,
                'avatarUrl' => str_replace(['127.0.0.1:8000', 'localhost:8000'], '10.0.2.2:8000', str_starts_with($anggota->foto, 'http') ? $anggota->foto : asset('storage/' . $anggota->foto)),
            ]
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $anggota = Anggota::find($id);

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota staf tidak ditemukan'
            ], 404);
        }

        // Safe delete cascading records
        $anggota->tasks()->delete();
        $anggota->evaluations()->delete();

        // Save name for notification before deleting
        $deletedName = $anggota->nama;

        $anggota->delete();

        // Create System Notification
        SystemNotification::create([
            'title' => 'Staf Dihapus: ' . $deletedName,
            'description' => 'Data kepegawaian ' . $deletedName . ' telah dihapus dari sistem.',
            'time_ago' => 'Baru saja',
            'type' => 'error',
            'color' => '#EF4444', // red
            'is_read' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Anggota staf berhasil dihapus dari sistem!'
        ]);
    }

    public function getDivisions(): JsonResponse
    {
        $divisions = Divisi::all()->map(function ($div) {
            return [
                'id' => $div->id,
                'name' => $div->nama,
                'code' => $div->kode,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $divisions
        ]);
    }
}
