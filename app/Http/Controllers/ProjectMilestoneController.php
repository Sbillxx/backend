<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMilestone;
use Illuminate\Http\Request;

class ProjectMilestoneController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $status = $validated['status'] ?? 'pending';

        $project->milestones()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'status' => $status,
            'order' => $project->milestones()->count() + 1,
        ]);

        $project->recalculateProgress();

        return redirect()->back()->with('success', 'Milestone berhasil ditambahkan.');
    }

    public function update(Request $request, Project $project, ProjectMilestone $milestone)
    {
        if ($milestone->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $milestone->update($validated);
        $project->recalculateProgress();

        return redirect()->back()->with('success', 'Milestone berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Project $project, ProjectMilestone $milestone)
    {
        if ($milestone->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $milestone->update(['status' => $validated['status']]);
        $project->recalculateProgress();

        return redirect()->back()->with('success', 'Status milestone berhasil diubah.');
    }

    public function destroy(Project $project, ProjectMilestone $milestone)
    {
        if ($milestone->project_id !== $project->id) {
            abort(404);
        }

        $milestone->delete();
        $project->recalculateProgress();

        return redirect()->back()->with('success', 'Milestone berhasil dihapus.');
    }
}
