<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'enrolled_at',
        'completed_at',
        'certificate_uuid',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function getProgressPercentageAttribute(): int
    {
        $total = $this->course->lessons()->count();
        if ($total === 0) return 0;
        $completed = $this->lessonProgress()->whereNotNull('completed_at')->count();
        return (int) round(($completed / $total) * 100);
    }

    public function getLastLessonIdAttribute(): ?int
    {
        $latest = $this->lessonProgress()->whereNotNull('completed_at')->latest('completed_at')->first();
        return $latest?->lesson_id;
    }
}
