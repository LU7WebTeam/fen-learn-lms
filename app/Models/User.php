<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'two_factor_code',
        'two_factor_code_expires_at',
        'role',
        'avatar',
        'gender',
        'race',
        'state',
        'birthdate',
        'occupation',
        'occupation_other',
        'student_id',
        'organization',
        'profile_completed_at',
        'suspended_at',
        'suspension_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'profile_completed_at' => 'datetime',
            'suspended_at'         => 'datetime',
            'two_factor_code_expires_at' => 'datetime',
            'birthdate'            => 'date',
            'password'             => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'content_editor', 'course_viewer'], true);
    }

    public function isCourseViewer(): bool
    {
        return $this->role === 'course_viewer';
    }

    public function canManageCourses(): bool
    {
        return in_array($this->role, ['super_admin', 'content_editor'], true);
    }

    public function canViewCourse(Course $course): bool
    {
        if ($this->canManageCourses()) {
            return true;
        }

        if (!$this->isCourseViewer()) {
            return false;
        }

        return $this->permittedCourses()->where('courses.id', $course->id)->exists();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isSuspended(): bool
    {
        return !is_null($this->suspended_at);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function permittedCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_access')
            ->withPivot(['access_level', 'granted_by', 'granted_at'])
            ->withTimestamps();
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
