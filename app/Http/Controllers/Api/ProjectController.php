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

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                $documentName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $documentName, 'public');
                \App\Models\ProjectDocument::create([
                    'project_id' => $proj->id,
                    'file_name' => $documentName,
                    'file_path' => $path,
                ]);
            }
        } elseif ($request->hasFile('document_file')) { // Backward compatibility
            $file = $request->file('document_file');
            $documentName = $file->getClientOriginalName();
            $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $documentName, 'public');
            \App\Models\ProjectDocument::create([
                'project_id' => $proj->id,
                'file_name' => $documentName,
                'file_path' => $path,
            ]);
        }

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
                'documents' => $proj->documents->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->file_name,
                        'url' => $doc->document_url,
                    ];
                }),
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

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                $documentName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $documentName, 'public');
                \App\Models\ProjectDocument::create([
                    'project_id' => $proj->id,
                    'file_name' => $documentName,
                    'file_path' => $path,
                ]);
            }
        } elseif ($request->hasFile('document_file')) { // Backward compatibility
            $file = $request->file('document_file');
            $documentName = $file->getClientOriginalName();
            $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $documentName, 'public');
            \App\Models\ProjectDocument::create([
                'project_id' => $proj->id,
                'file_name' => $documentName,
                'file_path' => $path,
            ]);
        }

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
                'document_url' => $proj->document_url,
                'document_name' => $proj->document_name,
            ]
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $proj = Project::findOrFail($id);
        $projName = $proj->name;
        $proj->delete();
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
        }, 'tasks.assignedUser', 'documents'])->find($id);

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
            'documents' => $proj->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->file_name,
                    'url' => $doc->document_url,
                ];
            }),
            'assignedStaff' => $proj->assigned_staff ? (json_decode($proj->assigned_staff, true) ?? []) : [],
            'milestones' => $proj->milestones->map(function($m) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'dueDate' => $m->due_date?->format('d M Y'),
                    'status' => $m->status,
                    'progress' => $m->progress_percentage,
                    'completedTasksCount' => $m->completed_tasks_count,
                    'totalTasksCount' => $m->total_tasks_count,
                ];
            }),
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

    public function uploadDocuments(Request $request, $id): JsonResponse
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['status' => 'error', 'message' => 'Project not found'], 404);
        }

        $request->validate([
            'document_files' => 'required|array',
            'document_files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('document_files')) {
            $files = $request->file('document_files');
            foreach ($files as $file) {
                $fileName = $file->getClientOriginalName();
                $path = $file->storeAs('projects/documents', time() . '_' . uniqid() . '_' . $fileName, 'public');
                
                \App\Models\ProjectDocument::create([
                    'project_id' => $project->id,
                    'file_name' => $fileName,
                    'file_path' => $path,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Documents uploaded successfully.',
        ], 201);
    }

    public function deleteDocument($projectId, $documentId): JsonResponse
    {
        $document = \App\Models\ProjectDocument::where('project_id', $projectId)->find($documentId);

        if (!$document) {
            return response()->json(['status' => 'error', 'message' => 'Document not found'], 404);
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Document deleted successfully.',
        ]);
    }

    public function getMilestones($id): JsonResponse
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['status' => 'error', 'message' => 'Project not found'], 404);
        }

        $milestones = $project->milestones->map(function($m) {
            return [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'dueDate' => $m->due_date?->format('d M Y'),
                'status' => $m->status,
                'progress' => $m->progress_percentage,
                'completedTasksCount' => $m->completed_tasks_count,
                'totalTasksCount' => $m->total_tasks_count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'milestones' => $milestones
            ]
        ]);
    }

    public function storeMilestone(Request $request, $id): JsonResponse
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['status' => 'error', 'message' => 'Project not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'dueDate' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $milestone = $project->milestones()->create([
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->dueDate ? \Carbon\Carbon::parse($request->dueDate)->format('Y-m-d') : null,
            'status' => $request->status ?? 'pending',
            'order' => $project->milestones()->count() + 1,
        ]);

        $project->recalculateProgress();

        return response()->json([
            'status' => 'success',
            'message' => 'Milestone created successfully.',
            'data' => [
                'milestone' => [
                    'id' => $milestone->id,
                    'title' => $milestone->title,
                    'description' => $milestone->description,
                    'dueDate' => $milestone->due_date?->format('d M Y'),
                    'status' => $milestone->status,
                    'progress' => $milestone->progress_percentage,
                ],
                'projectProgress' => (float)($project->fresh()->progress / 100),
            ]
        ], 201);
    }

    public function updateMilestone(Request $request, $id, $milestoneId): JsonResponse
    {
        $milestone = \App\Models\ProjectMilestone::where('project_id', $id)->find($milestoneId);
        if (!$milestone) {
            return response()->json(['status' => 'error', 'message' => 'Milestone not found'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'dueDate' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,in_progress,completed',
        ]);

        if ($request->has('title')) $milestone->title = $request->title;
        if ($request->has('description')) $milestone->description = $request->description;
        if ($request->has('dueDate')) {
            $milestone->due_date = $request->dueDate ? \Carbon\Carbon::parse($request->dueDate)->format('Y-m-d') : null;
        }
        if ($request->has('status')) $milestone->status = $request->status;

        $milestone->save();

        $project = Project::find($id);
        $project->recalculateProgress();

        return response()->json([
            'status' => 'success',
            'message' => 'Milestone updated successfully.',
            'data' => [
                'projectProgress' => (float)($project->fresh()->progress / 100),
            ]
        ]);
    }

    public function deleteMilestone($id, $milestoneId): JsonResponse
    {
        $milestone = \App\Models\ProjectMilestone::where('project_id', $id)->find($milestoneId);
        if (!$milestone) {
            return response()->json(['status' => 'error', 'message' => 'Milestone not found'], 404);
        }

        $milestone->delete();

        $project = Project::find($id);
        $project->recalculateProgress();

        return response()->json([
            'status' => 'success',
            'message' => 'Milestone deleted successfully.',
            'data' => [
                'projectProgress' => (float)($project->fresh()->progress / 100),
            ]
        ]);
    }
}
