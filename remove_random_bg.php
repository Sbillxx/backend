<?php
foreach(App\Models\Anggota::all() as $a) {
    if ($a->foto) {
        $a->foto = str_replace('&background=random', '', $a->foto);
        $a->save();
    }
}
foreach(App\Models\User::all() as $u) {
    if ($u->profile_image) {
        $u->profile_image = str_replace('&background=random', '', $u->profile_image);
        $u->save();
    }
}
echo "Removed background=random!\n";
