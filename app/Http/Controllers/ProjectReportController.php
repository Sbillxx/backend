<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\ProjectReport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectReportController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png', // max 10MB
            'description' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        
        // Generate safe path
        $path = $file->storeAs('project-reports/' . $project->id, Str::uuid() . '_' . $fileName, 'public');

        $project->reports()->create([
            'user_id' => auth()->id(),
            'file_name' => $fileName,
            'file_path' => $path,
            'type' => $file->getClientOriginalExtension(),
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil diunggah.');
    }

    public function destroy(Project $project, ProjectReport $report)
    {
        // Pastikan hanya pengunggah atau admin yang bisa hapus
        if (auth()->id() !== $report->user_id && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        // Hapus file dari storage
        if (Storage::disk('public')->exists($report->file_path)) {
            Storage::disk('public')->delete($report->file_path);
        }

        $report->delete();

        return redirect()->back()->with('success', 'Laporan berhasil dihapus.');
    }
}
