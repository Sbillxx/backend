<?php
foreach(App\Models\User::all() as $u) {
    echo 'ID: ' . $u->id . ' profile_image len: ' . strlen($u->profile_image) . ' is_svg: ' . (strpos($u->profile_image, 'svg') !== false ? 'yes' : 'no') . PHP_EOL;
}
