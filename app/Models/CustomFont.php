<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CustomFont extends Model
{
    protected $fillable = [
        'name',
        'family',
        'regular_path',
        'bold_path',
        'italic_path',
        'bold_italic_path',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected $appends = [
        'regular_url',
        'bold_url',
        'italic_url',
        'bold_italic_url',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getRegularUrlAttribute(): ?string
    {
        return $this->regular_path ? Storage::url($this->regular_path) : null;
    }

    public function getBoldUrlAttribute(): ?string
    {
        return $this->bold_path ? Storage::url($this->bold_path) : null;
    }

    public function getItalicUrlAttribute(): ?string
    {
        return $this->italic_path ? Storage::url($this->italic_path) : null;
    }

    public function getBoldItalicUrlAttribute(): ?string
    {
        return $this->bold_italic_path ? Storage::url($this->bold_italic_path) : null;
    }
}
