<?php
$user = App\Models\User::find(1);
if ($user) {
    $user->profile_image = 'https://ui-avatars.com/api/?name=Kepala&background=random&format=png';
    $user->save();
}
echo "User 1 profile image reset!\n";
