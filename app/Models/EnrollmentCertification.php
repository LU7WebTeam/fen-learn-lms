<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'course_certification_id',
        'certificate_uuid',
        'issued_at',
        'template_snapshot_json',
        'recipient_snapshot_json',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'template_snapshot_json' => 'array',
            'recipient_snapshot_json' => 'array',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function certification(): BelongsTo
    {
        return $this->belongsTo(CourseCertification::class, 'course_certification_id');
    }
}
