<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Divisi;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::with('divisi');

        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $projects = $query->orderBy('created_at', 'desc')->get()->map(function ($proj) {
            return [
                'id' => $proj->id,
                'name' => $proj->name,
                'description' => $proj->description ?? '',
                'targetDate' => $proj->target_date ?? ($proj->due_date ? \Carbon\Carbon::parse($proj->due_date)->format('d M Y') : 'Belum ditentukan'),
                'progress' => (is_numeric($proj->progress) ? (float)($proj->progress / 100) : 0.0),
                'workload' => $proj->workload ?? 'NORMAL',
                'division' => $proj->divisi ? $proj->divisi->nama : 'N/A',
                'assignedStaff' => $proj->assigned_staff ? (json_decode($proj->assigned_staff, true) ?? []) : [],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'projects' => $projects
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'targetDate' => 'required|string',
            'workload' => 'required|string',
            'division' => 'required|string',
            'assignedStaff' => 'nullable|array',
        ]);

        // Find or create division
        $divisi = Divisi::where('nama', $request->division)->first();
        if (!$divisi) {
            $divisi = Divisi::create([
                'nama' => $request->division,
                'kode' => strtoupper(substr($request->division, 0, 3))
            ]);
        }

        $proj = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'target_date' => $request->targetDate,
            'progress' => 0.0, // New projects start at 0%
            'workload' => $request->workload,
            'divisi_id' => $divisi->id,
            'assigned_staff' => json_encode($request->assignedStaff ?? []),
            'user_id' => 1, // Default user_id for mobile creation
        ]);

        // Sync to pivot table based on names for Web App compatibility
        if (!empty($request->assignedStaff)) {
            $userIds = \App\Models\User::whereIn('name', $request->assignedStaff)->pluck('id')->toArray();
            $proj->assignedUsers()->sync($userIds);
        }

        // Recalculate workload for all staff
        foreach (\App\Models\Anggota::all() as $anggota) {
            $anggota->recalculateWorkload();
        }

        // Create dynamic system notification for new project
        SystemNotification::create([
            'title' => 'Proyek Baru: ' . $proj->name . ' diluncurkan',
            'description' => 'Deskripsi: ' . ($proj->description ?? 'Tidak ada deskripsi') . ' (Divisi: ' . $divisi->nama . ')',
            'time_ago' => 'Baru saja',
            'type' => 'info',
            'color' => '#3B82F6', // blue
            'is_read' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Proyek baru berhasil disimpan!',
            'data' => [
                'id' => $proj->id,
                'name' => $proj->name,
                'description' => $proj->description ?? '',
                'targetDate' => $proj->target_date,
                'progress' => (is_numeric($proj->progress) ? (float)($proj->progress / 100) : 0.0),
                'workload' => $proj->workload,
                'division' => $divisi->nama,
                'assignedStaff' => json_decode($proj->assigned_staff, true) ?? [],
            ]
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $proj = Project::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'targetDate' => 'sometimes|required|string',
            'workload' => 'sometimes|required|string',
            'division' => 'sometimes|required|string',
            'assignedStaff' => 'nullable|array',
        ]);

        $oldTargetDate = $proj->target_date;

        if ($request->has('name')) {
            $proj->name = $request->name;
        }
        if ($request->has('description')) {
            $proj->description = $request->description;
        }
        if ($request->has('targetDate')) {
            $proj->target_date = $request->targetDate;
        }
        if ($request->has('workload')) {
            $proj->workload = $request->workload;
        }
        if ($request->has('division')) {
            $divisi = Divisi::where('nama', $request->division)->first();
            if (!$divisi) {
                $divisi = Divisi::create([
                    'nama' => $request->division,
                    'kode' => strtoupper(substr($request->division, 0, 3))
                ]);
            }
            $proj->divisi_id = $divisi->id;
        }
        if ($request->has('assignedStaff')) {
            $proj->assigned_staff = json_encode($request->assignedStaff);
            
            // Sync to pivot table based on names for Web App compatibility
            $userIds = \App\Models\User::whereIn('name', $request->assignedStaff)->pluck('id')->toArray();
            $proj->assignedUsers()->sync($userIds);
        }

        $proj->save();

        // Recalculate workload for all staff
        foreach (\App\Models\Anggota::all() as $anggota) {
            $anggota->recalculateWorkload();
        }

        // Generate notification if target date was updated
        if ($request->has('targetDate') && $oldTargetDate !== $proj->target_date) {
            SystemNotification::create([
                'title' => 'Tenggat Diubah: ' . $proj->name,
                'description' => 'Target penyelesaian disesuaikan dari ' . $oldTargetDate . ' menjadi ' . $proj->target_date,
                'time_ago' => 'Baru saja',
                'type' => 'info',
                'color' => '#3B82F6', // blue
                'is_read' => false
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Proyek berhasil diperbarui!',
            'data' => [
                'id' => $proj->id,
                'name' => $proj->name,
                'description' => $proj->description ?? '',
                'targetDate' => $proj->target_date,
                'progress' => (is_numeric($proj->progress) ? (float)($proj->progress / 100) : 0.0),
                'workload' => $proj->workload,
                'division' => $proj->divisi ? $proj->divisi->nama : 'N/A',
                'assignedStaff' => json_decode($proj->assigned_staff, true) ?? [],
            ]
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $proj = Project::find($id);
        
        if (!$proj) {
            return response()->json([
                'status' => 'error',
                'message' => 'Proyek tidak ditemukan'
            ], 404);
        }
        
        $projName = $proj->name;
        $proj->delete();
        
        // Recalculate workload for all staff after deleting the project
        foreach (\App\Models\Anggota::all() as $anggota) {
            $anggota->recalculateWorkload();
        }
        
        // Create dynamic system notification for deleted project
        SystemNotification::create([
            'title' => 'Proyek Dihapus: ' . $projName,
            'description' => 'Inisiatif proyek ini telah dihapus oleh eksekutif.',
            'time_ago' => 'Baru saja',
            'type' => 'warning',
            'color' => '#EF4444', // red
            'is_read' => false
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Proyek berhasil dihapus!'
        ]);
    }

    public function show($id): JsonResponse
    {
        $proj = Project::with(['tasks' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }, 'tasks.assignedUser'])->find($id);

        if (!$proj) {
            return response()->json([
                'status' => 'error',
                'message' => 'Proyek tidak ditemukan'
            ], 404);
        }

        $projectData = [
            'id' => $proj->id,
            'name' => $proj->name,
            'description' => $proj->description ?? '',
            'targetDate' => $proj->target_date ?? ($proj->due_date ? \Carbon\Carbon::parse($proj->due_date)->format('d M Y') : 'Belum ditentukan'),
            'progress' => (is_numeric($proj->progress) ? (float)($proj->progress / 100) : 0.0),
            'workload' => $proj->workload ?? 'NORMAL',
            'division' => $proj->divisi ? $proj->divisi->nama : 'N/A',
            'assignedStaff' => $proj->assigned_staff ? (json_decode($proj->assigned_staff, true) ?? []) : [],
            'tasks' => $proj->tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'image_url' => $task->image_url,
                    'created_at' => $task->created_at->format('d M Y, H:i'),
                    'user_name' => $task->assignedUser ? $task->assignedUser->name : 'Unknown User',
                ];
            })
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'project' => $projectData
            ]
        ]);
    }
}
