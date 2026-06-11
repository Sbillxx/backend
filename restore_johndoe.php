<?php
$a = App\Models\Anggota::find(8);
if ($a) {
    $a->foto = 'profiles/PEKgIDXIDZJuBF9sEVDhOJ25iIaj37MPHvaultkx.jpg';
    $a->save();
}
echo "John Doe photo restored!\n";
