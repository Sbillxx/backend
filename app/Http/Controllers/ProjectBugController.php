<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectBug;
use App\Models\ProjectTask;
use Illuminate\Http\Request;

class ProjectBugController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'severity' => 'required|in:low,medium,high,critical',
        ]);

        $validated['project_id'] = $project->id;
        ProjectBug::create($validated);

        return back()->with('success', 'Bug reported successfully');
    }

    public function convertToTask(Request $request, Project $project, ProjectBug $bug)
    {
        // Ensure bug belongs to project
        abort_if($bug->project_id !== $project->id, 404);

        $priorityMap = [
            'critical' => 'urgent',
            'high' => 'high',
            'medium' => 'medium',
            'low' => 'low',
        ];

        ProjectTask::create([
            'title' => $bug->title,
            'description' => $bug->description,
            'status' => 'todo',
            'priority' => $priorityMap[$bug->severity] ?? 'medium',
            'due_date' => null,
            'project_id' => $project->id,
            'assigned_to' => null,
        ]);

        $bug->update(['status' => 'converted']);

        return back()->with('success', 'Bug converted to task');
    }

    public function destroy(Project $project, ProjectBug $bug)
    {
        abort_if($bug->project_id !== $project->id, 404);
        $bug->delete();
        return back()->with('success', 'Bug deleted');
    }
}

