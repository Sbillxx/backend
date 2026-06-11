<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anggotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('divisi_id')->constrained('divisis')->onDelete('cascade');
            $table->string('nama');
            $table->string('jabatan');
            $table->text('foto')->nullable();
            $table->string('status')->default('NORMAL'); // 'NORMAL', 'HIGH', 'AT RISK'
            $table->integer('workload_percentage')->default(50);
            $table->integer('total_tasks')->default(0);
            $table->integer('active_tasks_count')->default(0);
            $table->double('reliability')->default(100.0);
            $table->integer('weekly_output')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anggotas');
    }
};
