<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Divisi;
use App\Models\Anggota;
use App\Models\Task;
use App\Models\Evaluation;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\SystemNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key constraints to safely truncate
        Schema::disableForeignKeyConstraints();
        
        // Truncate all tables to reset Auto-Increment IDs
        User::truncate();
        Anggota::truncate();
        Divisi::truncate();
        Task::truncate();
        Evaluation::truncate();
        Project::truncate();
        ProjectTask::truncate();
        SystemNotification::truncate();
        
        Schema::enableForeignKeyConstraints();

        // 1. Create Divisions/Bidang
        $uix = Divisi::create(['nama' => 'UI/UX Design', 'kode' => 'UIX']);
        $fed = Divisi::create(['nama' => 'Front-end Development', 'kode' => 'FED']);
        $bed = Divisi::create(['nama' => 'Back-end Development', 'kode' => 'BED']);
        $qa = Divisi::create(['nama' => 'Quality Assurance', 'kode' => 'QA']);
        $qc = Divisi::create(['nama' => 'Quality Control', 'kode' => 'QC']);

        // 2. Create Default Executive User
        $executiveUser = User::create([
            'name' => 'Kepala',
            'email' => 'executive@kominfo.go.id',
            'password' => 'password123', // auto-hashed by User model cast
        ]);
        
        // Delete the automatically created Anggota for Kepala to keep him out of the staff list
        Anggota::where('user_id', $executiveUser->id)->delete();

        // 3. Create Staff Users & Anggotas (7 Staff with Sundanese Names)
        $staffData = [
            [
                'name' => 'Encep Sunandar',
                'email' => 'encep@gmail.com',
                'role' => 'Lead UI/UX Designer',
                'divisi_id' => $uix->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Encep+Sunandar&background=0D8ABC&color=fff',
            ],
            [
                'name' => 'Cecep Supriadi',
                'email' => 'cecep@gmail.com',
                'role' => 'Senior Front-end Developer',
                'divisi_id' => $fed->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Cecep+Supriadi&background=F39C12&color=fff',
            ],
            [
                'name' => 'Asep Kurniawan',
                'email' => 'asep@gmail.com',
                'role' => 'Front-end Developer',
                'divisi_id' => $fed->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Asep+Kurniawan&background=2ECC71&color=fff',
            ],
            [
                'name' => 'Ujang Mulyana',
                'email' => 'ujang@gmail.com',
                'role' => 'Lead Back-end Developer',
                'divisi_id' => $bed->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Ujang+Mulyana&background=9B59B6&color=fff',
            ],
            [
                'name' => 'Dadang Hermawan',
                'email' => 'dadang@gmail.com',
                'role' => 'Back-end Developer',
                'divisi_id' => $bed->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Dadang+Hermawan&background=34495E&color=fff',
            ],
            [
                'name' => 'Neng Rohayati',
                'email' => 'neng@gmail.com',
                'role' => 'QA Engineer',
                'divisi_id' => $qa->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Neng+Rohayati&background=E74C3C&color=fff',
            ],
            [
                'name' => 'Euis Dahlia',
                'email' => 'euis@gmail.com',
                'role' => 'QC Inspector',
                'divisi_id' => $qc->id,
                'avatar' => 'https://ui-avatars.com/api/?name=Euis+Dahlia&background=1ABC9C&color=fff',
            ],
        ];

        $anggotas = [];
        foreach ($staffData as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => 'password123',
            ]);

            // Find auto-created Anggota (via User booted event) and update details
            $anggota = Anggota::where('user_id', $user->id)->first();
            $anggota->update([
                'divisi_id' => $data['divisi_id'],
                'jabatan' => $data['role'],
                'foto' => $data['avatar'],
                'reliability' => 95.0,
            ]);
            
            $anggotas[$data['name']] = $anggota;
        }

        // 5. Seed Evaluations
        Evaluation::create([
            'anggota_id' => $anggotas['Encep Sunandar']->id,
            'note' => 'Hasil rancangan UI/UX sangat premium dan rapi.',
            'date' => '12 Mei 2026',
            'rating' => 4.8
        ]);
        Evaluation::create([
            'anggota_id' => $anggotas['Ujang Mulyana']->id,
            'note' => 'Stabilitas backend API dipertahankan dengan sangat baik.',
            'date' => '18 Mei 2026',
            'rating' => 4.5
        ]);

        // 6. Seed Projects (5 Projects total as requested)
        $proj1 = Project::create([
            'name' => 'Stitch Location Tracker',
            'description' => 'Aplikasi pemantauan koordinat GPS and log aktivitas lapangan.',
            'target_date' => '15 Jun 2026',
            'progress' => 85,
            'workload' => 'NORMAL',
            'divisi_id' => $bed->id,
            'assigned_staff' => json_encode(['Ujang Mulyana', 'Dadang Hermawan']),
            'user_id' => $executiveUser->id,
        ]);
        
        $proj2 = Project::create([
            'name' => 'Halal Certificate Hub',
            'description' => 'Sistem pengajuan sertifikat halal terintegrasi kementerian.',
            'target_date' => '25 Jul 2026',
            'progress' => 45,
            'workload' => 'HIGH',
            'divisi_id' => $fed->id,
            'assigned_staff' => json_encode(['Cecep Supriadi', 'Asep Kurniawan']),
            'user_id' => $executiveUser->id,
        ]);

        $proj3 = Project::create([
            'name' => 'Audit Desain Q3',
            'description' => 'Visualisasi performa and audit komprehensif eksekutif.',
            'target_date' => '10 Jun 2026',
            'progress' => 100,
            'workload' => 'NORMAL',
            'divisi_id' => $uix->id,
            'assigned_staff' => json_encode(['Encep Sunandar']),
            'user_id' => $executiveUser->id,
        ]);

        $proj4 = Project::create([
            'name' => 'SAKIP Analytics',
            'description' => 'Analisis data kepatuhan kinerja instansi pemerintah secara berkala.',
            'target_date' => '30 Jun 2026',
            'progress' => 25,
            'workload' => 'AT RISK',
            'divisi_id' => $qa->id,
            'assigned_staff' => json_encode(['Neng Rohayati']),
            'user_id' => $executiveUser->id,
        ]);

        $proj5 = Project::create([
            'name' => 'e-OPD Smart System',
            'description' => 'Integrasi sistem pelaporan kinerja OPD tingkat kabupaten.',
            'target_date' => '15 Jul 2026',
            'progress' => 60,
            'workload' => 'NORMAL',
            'divisi_id' => $qc->id,
            'assigned_staff' => json_encode(['Euis Dahlia']),
            'user_id' => $executiveUser->id,
        ]);

        // Sync to pivot table
        $proj1->assignedUsers()->sync([$anggotas['Ujang Mulyana']->user_id, $anggotas['Dadang Hermawan']->user_id]);
        $proj2->assignedUsers()->sync([$anggotas['Cecep Supriadi']->user_id, $anggotas['Asep Kurniawan']->user_id]);
        $proj3->assignedUsers()->sync([$anggotas['Encep Sunandar']->user_id]);
        $proj4->assignedUsers()->sync([$anggotas['Neng Rohayati']->user_id]);
        $proj5->assignedUsers()->sync([$anggotas['Euis Dahlia']->user_id]);

        // 7. Seed Project Tasks
        // Project 1 (Stitch Location Tracker) tasks
        ProjectTask::create([
            'project_id' => $proj1->id,
            'title' => 'Integrasi API Mapbox',
            'description' => 'Menghubungkan endpoint GPS.',
            'status' => 'completed',
            'priority' => 'high',
            'assigned_to' => $anggotas['Ujang Mulyana']->user_id,
        ]);
        ProjectTask::create([
            'project_id' => $proj1->id,
            'title' => 'Setup Database Relasional Spasial',
            'description' => 'Optimasi PostgreSQL PostGIS.',
            'status' => 'completed',
            'priority' => 'medium',
            'assigned_to' => $anggotas['Dadang Hermawan']->user_id,
        ]);

        // Project 2 (Halal Certificate Hub) tasks
        ProjectTask::create([
            'project_id' => $proj2->id,
            'title' => 'Responsive Dashboard Layout',
            'description' => 'Penyesuaian UI tablet.',
            'status' => 'in_progress',
            'priority' => 'medium',
            'assigned_to' => $anggotas['Cecep Supriadi']->user_id,
        ]);
        ProjectTask::create([
            'project_id' => $proj2->id,
            'title' => 'Integrasi Auth JWT',
            'description' => 'Keamanan login multi-role.',
            'status' => 'completed',
            'priority' => 'high',
            'assigned_to' => $anggotas['Asep Kurniawan']->user_id,
        ]);

        // Project 4 (SAKIP Analytics) tasks
        ProjectTask::create([
            'project_id' => $proj4->id,
            'title' => 'Review Dokumen SAKIP 2025',
            'description' => 'Melakukan review kelayakan dokumen kepatuhan SAKIP tahun lalu.',
            'status' => 'completed',
            'priority' => 'medium',
            'assigned_to' => $anggotas['Neng Rohayati']->user_id,
        ]);
        ProjectTask::create([
            'project_id' => $proj4->id,
            'title' => 'Automasi Integrasi Data Pemda',
            'description' => 'Pengambilan data otomatis dari server instansi Pemda.',
            'status' => 'in_progress',
            'priority' => 'high',
            'assigned_to' => $anggotas['Neng Rohayati']->user_id,
        ]);

        // Project 5 (e-OPD Smart System) tasks
        ProjectTask::create([
            'project_id' => $proj5->id,
            'title' => 'Penyusunan Standard Operating Procedure (SOP)',
            'description' => 'Menyusun dokumen SOP penginputan data laporan kerja OPD.',
            'status' => 'completed',
            'priority' => 'medium',
            'assigned_to' => $anggotas['Euis Dahlia']->user_id,
        ]);
        ProjectTask::create([
            'project_id' => $proj5->id,
            'title' => 'Uji Coba Sistem Terpadu',
            'description' => 'Pengujian performa sistem di tingkat server lokal.',
            'status' => 'in_progress',
            'priority' => 'low',
            'assigned_to' => $anggotas['Euis Dahlia']->user_id,
        ]);

        // 8. Seed System Notifications
        SystemNotification::create([
            'title' => 'Encep Sunandar menyelesaikan proyek Audit Desain Q3',
            'description' => 'Proyek diselesaikan dengan presisi tinggi.',
            'time_ago' => '10 menit yang lalu',
            'type' => 'project',
            'color' => '#10B981',
            'is_read' => false,
        ]);

        // Recalculate workload and task counts for all staff
        foreach (Anggota::all() as $anggota) {
            $anggota->recalculateWorkload();
        }
    }
}
