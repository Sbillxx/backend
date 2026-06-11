<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Anggota;

// Delete existing anggotas that don't match, or just clear and recreate?
// Let's keep existing anggotas and just link if name matches, or create new ones for users without anggotas.
$users = User::all();

foreach ($users as $user) {
    $anggota = Anggota::where('nama', $user->name)
                ->orWhere('user_id', $user->id)
                ->first();
                
    if ($anggota) {
        // Update user_id
        $anggota->user_id = $user->id;
        if ($user->profile_image) {
             $anggota->foto = $user->profile_image;
        }
        $anggota->save();
        echo "Linked existing anggota for user {$user->name}\n";
    } else {
        // Create new
        $anggota = new Anggota();
        $anggota->user_id = $user->id;
        $anggota->nama = $user->name;
        $anggota->jabatan = 'Staff'; // Default
        $anggota->status = 'NORMAL';
        $anggota->divisi_id = 1; // Default
        $anggota->workload_percentage = 0;
        $anggota->total_tasks = 0;
        $anggota->active_tasks_count = 0;
        $anggota->reliability = 100.0;
        $anggota->weekly_output = 0;
        $anggota->foto = $user->profile_image ?? 'https://ui-avatars.com/api/?name=' . urlencode($user->name);
        $anggota->save();
        echo "Created new anggota for user {$user->name}\n";
    }
}

echo "Sync complete.\n";
