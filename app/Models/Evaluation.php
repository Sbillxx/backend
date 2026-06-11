<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    protected $fillable = ['anggota_id', 'note', 'date', 'rating'];

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class);
    }
}
