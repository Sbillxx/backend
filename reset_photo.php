<?php
$a = App\Models\Anggota::find(8);
if ($a) {
    $a->foto = 'https://ui-avatars.com/api/?name=John+Doe&background=random';
    $a->save();
}
echo "Done.";
