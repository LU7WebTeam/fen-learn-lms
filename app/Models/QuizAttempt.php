<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'lesson_id',
        'enrollment_id',
        'attempt_number',
        'answers',
        'score',
        'max_score',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'passed'  => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function getPercentageAttribute(): int
    {
        return $this->max_score > 0
            ? (int) round(($this->score / $this->max_score) * 100)
            : 0;
    }
}
