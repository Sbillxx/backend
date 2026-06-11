<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Divisi extends Model
{
    protected $fillable = ['nama', 'kode'];

    public function anggotas(): HasMany
    {
        return $this->hasMany(Anggota::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(MobileProject::class, 'divisi_id');
    }
}
