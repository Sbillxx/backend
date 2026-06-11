<?php
$a = App\Models\Anggota::find(5);
if ($a) {
    $a->foto = 'https://ui-avatars.com/api/?name=Kepala&background=random';
    $a->save();
}
echo "Kepala photo reset.\n";
