<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Divisi;
use App\Models\Anggota;
use App\Models\Task;
use App\Models\Evaluation;
use App\Models\Project;
use App\Models\SystemNotification;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default User
        User::factory()->create([
            'name' => 'Kepala',
            'email' => 'executive@kominfo.go.id',
            'profile_image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjPYthawamKptO2svXYC5fv264uFWWqQl9In0-GIhvdJMYbhV91YV9oAn2yg7r43B96sIFx5ecN_i4KNfN2pysyEnFB3xtlQ8-fQLACG6d-HN-MC_1CZkmrqyplTuoFpHs2qIu4ZyYphrM8yyKitoUygP9PlXww_CrNTgeIqyjop4D1BP74xVjeeWioLaIC1vtzYb7yHgXD5LuDqTH00v1sHmVKNKIYYwjyZtXmz-3munyX0ZhkPP5KF1IoscqtqdI7EGTUN1IlIyy',
            'password' => 'password123', // auto-hashed by cast
        ]);

        // 2. Seed Divisis
        $eng = Divisi::create(['nama' => 'Engineering', 'kode' => 'ENG']);
        $dsn = Divisi::create(['nama' => 'Design', 'kode' => 'DSN']);
        $ops = Divisi::create(['nama' => 'Operations', 'kode' => 'OPS']);
        $mkt = Divisi::create(['nama' => 'Marketing', 'kode' => 'MKT']);

        // 3. Seed Anggotas (Staff)
        $sarah = Anggota::create([
            'divisi_id' => $eng->id,
            'nama' => 'Sarah Chen',
            'jabatan' => 'Lead Software Engineer',
            'foto' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqWmAZ9YvCMMO733lcISL8wMnAyolrfiQZj6fLsbJsol-Jw0ezOu0UIK7xxUW5Dj2tRbfuYcPkRxh2ddGbYjA2BOmhfuLSgOCMaA9IaPjSUd1LwjCgUQZ3VZexLq80xSJoOEJGSWqPHDXOGz9AyR1gjxo6lUbROYkzPh9G1HOhTsPNOiV8k02UgoNKeFTsog2ctK2vkN5TmWWI3TKrtSCiHwwAHGJVn0HXhX9L0a4eGx7Tqw6ZM_8kTEa32HHYRG21yECfiSk__PKm',
            'status' => 'NORMAL',
            'workload_percentage' => 65,
            'total_tasks' => 12,
            'active_tasks_count' => 3,
            'reliability' => 98.4,
            'weekly_output' => 24,
        ]);

        $marcus = Anggota::create([
            'divisi_id' => $ops->id,
            'nama' => 'Marcus Wright',
            'jabatan' => 'Operations Manager',
            'foto' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGIUJY6ngEMdJ3nstXT0GnBoR-peJFwwBvbqBfL_AYICMvxXMZfA685S2Hn6uqUHLaYmwp2xMt2k7-XEHEQFbnPQ_FCg9Kd6N1QcQq7tKPYlQaLmA_yhvpy3bu4ZA0UZTHIpcxNdW0DotC9UVbvMMhOXdQDUdFPECO_3VzAmr8v1JY5nFHNGf5n_6oTf5UNshSXZqulsCqc1raQE52dVC1t5Zoo78i9LwVSnac8_oEZUvu6PMB6piQuN9eATNxSQpYdODT8jYINzg',
            'status' => 'HIGH',
            'workload_percentage' => 85,
            'total_tasks' => 18,
            'active_tasks_count' => 7,
            'reliability' => 91.2,
            'weekly_output' => 19,
        ]);

        $elena = Anggota::create([
            'divisi_id' => $eng->id,
            'nama' => 'Elena Rodriguez',
            'jabatan' => 'Senior DevOps Specialist',
            'foto' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrjxus22Vj_IuZzrZPIKnVoPypSi0zugFGVi4e4i43Ky8vnzeLyque-t7XnmSk29bQKn_u60Xlkqf3Hf1diSH8YmQf_y-gtkE8kYsYs-rIA2pD9uczo8LoA0wp_ExA2DTq9fuvjinorzB5UpBC4L4m3Y3U9T-Ik3EupczR2U8B32gDx4dShlAQ4GEjh40AA9GxEDhEbZ0oD7SOeqqXNWJ6D0yvw9fzAwHUNYkRrKTl0mAsm1tQ_gf8g1YD1wsv_VNvzxyT25tRpPtZ',
            'status' => 'AT RISK',
            'workload_percentage' => 92,
            'total_tasks' => 22,
            'active_tasks_count' => 9,
            'reliability' => 84.7,
            'weekly_output' => 15,
        ]);

        $david = Anggota::create([
            'divisi_id' => $dsn->id,
            'nama' => 'David Kim',
            'jabatan' => 'Lead UI/UX Designer',
            'foto' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjPYthawamKptO2svXYC5fv264uFWWqQl9In0-GIhvdJMYbhV91YV9oAn2yg7r43B96sIFx5ecN_i4KNfN2pysyEnFB3xtlQ8-fQLACG6d-HN-MC_1CZkmrqyplTuoFpHs2qIu4ZyYphrM8yyKitoUygP9PlXww_CrNTgeIqyjop4D1BP74xVjeeWioLaIC1vtzYb7yHgXD5LuDqTH00v1sHmVKNKIYYwjyZtXmz-3munyX0ZhkPP5KF1IoscqtqdI7EGTUN1IlIyy',
            'status' => 'NORMAL',
            'workload_percentage' => 50,
            'total_tasks' => 8,
            'active_tasks_count' => 2,
            'reliability' => 96.8,
            'weekly_output' => 28,
        ]);

        // 4. Seed Tasks
        Task::create([
            'anggota_id' => $sarah->id,
            'title' => 'Audit Keuangan Q3',
            'description' => 'Menyelesaikan audit kepatuhan pengeluaran anggaran Kominfo Triwulan 3.',
            'due_date' => '30 Jun 2026',
            'status' => 'ACTIVE'
        ]);
        Task::create([
            'anggota_id' => $sarah->id,
            'title' => 'Refactoring API Gateway',
            'description' => 'Optimasi rute backend untuk meningkatkan kecepatan respon server dasbor.',
            'due_date' => '15 Jul 2026',
            'status' => 'ACTIVE'
        ]);
        Task::create([
            'anggota_id' => $sarah->id,
            'title' => 'Integrasi Modul GPS - Stitch Tracker',
            'description' => 'Penyelarasan koordinat satelit ke API Flutter.',
            'due_date' => '10 Mei 2026',
            'status' => 'COMPLETED'
        ]);

        Task::create([
            'anggota_id' => $marcus->id,
            'title' => 'Evaluasi Keandalan Sistem',
            'description' => 'Mengevaluasi laporan kestabilan sistem cloud dan performa server PKL.',
            'due_date' => '25 Jun 2026',
            'status' => 'ACTIVE'
        ]);
        Task::create([
            'anggota_id' => $marcus->id,
            'title' => 'Rapat Koordinasi Vendor',
            'description' => 'Sinkronisasi tenggat waktu pengadaan perangkat keras server.',
            'due_date' => '05 Jun 2026',
            'status' => 'ACTIVE'
        ]);

        Task::create([
            'anggota_id' => $elena->id,
            'title' => 'Kubernetes Pod Recovery',
            'description' => 'Mengatasi kegagalan pod replikasi database secara berkala.',
            'due_date' => '01 Jun 2026',
            'status' => 'ACTIVE'
        ]);

        Task::create([
            'anggota_id' => $david->id,
            'title' => 'Desain Layout Mobile Dashboard',
            'description' => 'Menyusun wireframe and UI kit bertema Slate/Navy premium.',
            'due_date' => '18 Jun 2026',
            'status' => 'ACTIVE'
        ]);

        // 5. Seed Evaluations
        Evaluation::create([
            'anggota_id' => $sarah->id,
            'note' => 'Menunjukkan kinerja luar biasa dalam memimpin arsitektur clean-code.',
            'date' => '21 Mei 2026',
            'rating' => 5.0
        ]);
        Evaluation::create([
            'anggota_id' => $sarah->id,
            'note' => 'Penyelesaian integrasi modul GPS sangat rapi dan terdokumentasi dengan baik.',
            'date' => '12 Mei 2026',
            'rating' => 4.8
        ]);

        Evaluation::create([
            'anggota_id' => $marcus->id,
            'note' => 'Beban kerja manajemen operasi mendekati kapasitas kritis, diperlukan asisten pendukung.',
            'date' => '18 Mei 2026',
            'rating' => 4.2
        ]);

        Evaluation::create([
            'anggota_id' => $elena->id,
            'note' => 'Keterlambatan penyelesaian pod recovery dikarenakan kendala infrastruktur AWS.',
            'date' => '10 Mei 2026',
            'rating' => 3.8
        ]);

        // 6. Seed Projects
        Project::create([
            'name' => 'Stitch Location Tracker',
            'description' => 'Aplikasi pemantauan koordinat GPS and log aktivitas lapangan tim operasional.',
            'target_date' => '15 Jun 2026',
            'progress' => 0.85,
            'workload' => 'NORMAL',
            'divisi_id' => $eng->id,
            'assigned_staff' => json_encode(['Sarah Chen', 'Elena Rodriguez'])
        ]);
        Project::create([
            'name' => 'Halal Certificate Hub',
            'description' => 'Sistem automasi pengajuan sertifikat halal terintegrasi kementerian.',
            'target_date' => '25 Jul 2026',
            'progress' => 0.45,
            'workload' => 'HIGH',
            'divisi_id' => $eng->id,
            'assigned_staff' => json_encode(['Sarah Chen'])
        ]);
        Project::create([
            'name' => 'Inspektorat Dashboard',
            'description' => 'Visualisasi performa and audit komprehensif berbasis Flutter mobile.',
            'target_date' => '10 Jun 2026',
            'progress' => 0.95,
            'workload' => 'NORMAL',
            'divisi_id' => $dsn->id,
            'assigned_staff' => json_encode(['David Kim'])
        ]);
        Project::create([
            'name' => 'SAKIP Analytics',
            'description' => 'Analisis data kepatuhan kinerja instansi pemerintah secara berkala.',
            'target_date' => '30 Jun 2026',
            'progress' => 0.25,
            'workload' => 'AT RISK',
            'divisi_id' => $ops->id,
            'assigned_staff' => json_encode(['Marcus Wright'])
        ]);

        // 7. Seed System Notifications
        SystemNotification::create([
            'title' => 'Sarah Chen menyelesaikan tugas Q3 Financial Audit',
            'description' => 'Audit diselesaikan dengan akurasi 98.4% dan diserahkan tepat waktu.',
            'time_ago' => '10 menit yang lalu',
            'type' => 'task',
            'color' => '#10B981', // green
            'is_read' => false
        ]);
        SystemNotification::create([
            'title' => 'Peringatan Kapasitas Kerja: Marcus Wright',
            'description' => 'Beban kerja harian mencapai 85% dengan 7 tugas aktif. Tindakan disarankan.',
            'time_ago' => '42 menit yang lalu',
            'type' => 'warning',
            'color' => '#F59E0B', // amber
            'is_read' => false
        ]);
        SystemNotification::create([
            'title' => 'Kritikal: Elena Rodriguez (AT RISK)',
            'description' => 'Keterlambatan penyelesaian pada 3 tugas strategis. Segera hubungi divisi Ops.',
            'time_ago' => '2 jam yang lalu',
            'type' => 'error',
            'color' => '#EF4444', // red
            'is_read' => false
        ]);
        SystemNotification::create([
            'title' => 'Dasbor Proyek: Stitch Location Tracker',
            'description' => 'Progres keseluruhan naik menjadi 85% menyusul rilis modul sinkronisasi GPS.',
            'time_ago' => '5 jam yang lalu',
            'type' => 'info',
            'color' => '#3B82F6', // blue
            'is_read' => false
        ]);

        // Recalculate workload for all staff after seeding
        foreach (Anggota::all() as $anggota) {
            $anggota->recalculateWorkload();
        }
    }
}
