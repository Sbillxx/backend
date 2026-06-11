<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemNotification extends Model
{
    protected $fillable = ['title', 'description', 'time_ago', 'type', 'color', 'is_read'];
}
