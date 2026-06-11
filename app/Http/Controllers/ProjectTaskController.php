<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectTaskController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'progress' => 'required|integer|min:0|max:100',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('progress_logs', 'public');
        }

        // Save the progress log as a task
        ProjectTask::create([
            'project_id' => $project->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image_path' => $imagePath,
            'status' => 'completed', // Default value
            'priority' => 'medium',  // Default value
            'assigned_to' => auth()->id(), // Track who logged this
        ]);

        // Update the overall project's progress
        $project->update([
            'progress' => $validated['progress']
        ]);

        return redirect()->back()->with('success', 'Progress log created successfully!');
    }

    public function update(Request $request, Project $project, ProjectTask $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'progress' => 'required|integer|min:0|max:100',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
        ];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($task->image_path) {
                Storage::disk('public')->delete($task->image_path);
            }
            $updateData['image_path'] = $request->file('image')->store('progress_logs', 'public');
        }

        $task->update($updateData);

        $project->update([
            'progress' => $validated['progress']
        ]);

        return redirect()->back()->with('success', 'Progress log updated successfully!');
    }

    public function destroy(Project $project, ProjectTask $task)
    {
        if ($task->image_path) {
            Storage::disk('public')->delete($task->image_path);
        }
        
        $task->delete();

        return redirect()->back()->with('success', 'Progress log deleted successfully!');
    }
}
