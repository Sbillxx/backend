<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite cannot alter CHECK constraints directly; recreate table with new constraint
        if (DB::getDriverName() === 'sqlite') {
            DB::transaction(function () {
                // Create new table with updated enum (including 'qa')
                Schema::create('project_tasks_new', function (Blueprint $table) {
                    $table->id();
                    $table->string('title');
                    $table->text('description')->nullable();
                    $table->enum('status', ['todo', 'in_progress', 'qa', 'completed'])->default('todo');
                    $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                    $table->date('due_date')->nullable();
                    $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                    $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                    $table->timestamps();
                });

                // Copy data into new table (map any old status values directly)
                DB::statement('INSERT INTO project_tasks_new (id, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at)
                               SELECT id, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM project_tasks');

                // Drop old table and rename new one
                Schema::drop('project_tasks');
                Schema::rename('project_tasks_new', 'project_tasks');
            });
        } else {
            // For other drivers, try simple alter if supported
            Schema::table('project_tasks', function (Blueprint $table) {
                // Some DBs don't allow enum modification easily; fallback: ensure status allows 'qa'
                // Developers using MySQL/Postgres may need a manual enum alter if this no-op fails.
            });
        }
    }

    public function down(): void
    {
        // Revert to original without 'qa'
        if (DB::getDriverName() === 'sqlite') {
            DB::transaction(function () {
                Schema::create('project_tasks_old', function (Blueprint $table) {
                    $table->id();
                    $table->string('title');
                    $table->text('description')->nullable();
                    $table->enum('status', ['todo', 'in_progress', 'completed'])->default('todo');
                    $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                    $table->date('due_date')->nullable();
                    $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                    $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                    $table->timestamps();
                });

                // Map any 'qa' rows back to 'in_progress'
                DB::statement("INSERT INTO project_tasks_old (id, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at)
                               SELECT id, title, description, CASE WHEN status='qa' THEN 'in_progress' ELSE status END, priority, due_date, project_id, assigned_to, created_at, updated_at FROM project_tasks");

                Schema::drop('project_tasks');
                Schema::rename('project_tasks_old', 'project_tasks');
            });
        }
    }
};
