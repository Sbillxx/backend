<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();
        });

        // Migrate existing documents from projects table
        $projectsWithDocs = DB::table('projects')
            ->whereNotNull('document_path')
            ->get();

        foreach ($projectsWithDocs as $project) {
            DB::table('project_documents')->insert([
                'project_id' => $project->id,
                'file_name' => $project->document_name ?? 'Document',
                'file_path' => $project->document_path,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ]);
        }

        // Drop the old columns
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['document_path', 'document_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('document_path')->nullable();
            $table->string('document_name')->nullable();
        });

        // Migrate data back if possible (though we might lose some if multiple docs existed)
        $docs = DB::table('project_documents')->orderBy('id')->get();
        $processedProjects = [];
        foreach ($docs as $doc) {
            if (!in_array($doc->project_id, $processedProjects)) {
                DB::table('projects')->where('id', $doc->project_id)->update([
                    'document_path' => $doc->file_path,
                    'document_name' => $doc->file_name,
                ]);
                $processedProjects[] = $doc->project_id;
            }
        }

        Schema::dropIfExists('project_documents');
    }
};
