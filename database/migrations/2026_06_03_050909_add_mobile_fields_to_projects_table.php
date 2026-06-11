<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('target_date')->nullable();
            $table->double('progress')->default(0.0);
            $table->string('workload')->default('NORMAL');
            $table->foreignId('divisi_id')->nullable()->constrained('divisis')->onDelete('set null');
            $table->text('assigned_staff')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['divisi_id']);
            $table->dropColumn(['target_date', 'progress', 'workload', 'divisi_id', 'assigned_staff']);
        });
    }
};
