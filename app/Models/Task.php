<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = ['anggota_id', 'title', 'description', 'due_date', 'status'];

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class);
    }
}
