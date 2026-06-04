<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'code',
        'is_active',
        'priority',
        'conditions_json',
        'template_json',
        'requirements_json',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'priority' => 'integer',
            'conditions_json' => 'array',
            'template_json' => 'array',
            'requirements_json' => 'array',
        ];
    }

    public static function defaultConditions(): array
    {
        return [
            'occupation' => [
                'enabled' => false,
                'values' => [],
            ],
            'organization' => [
                'enabled' => false,
                'mode' => 'exact',
                'values' => [],
            ],
            'state' => [
                'enabled' => false,
                'values' => [],
            ],
            'age' => [
                'enabled' => false,
                'min' => null,
                'max' => null,
            ],
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function issuedCertificates(): HasMany
    {
        return $this->hasMany(EnrollmentCertification::class);
    }
}
