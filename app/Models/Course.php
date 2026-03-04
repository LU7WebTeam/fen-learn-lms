<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'category',
        'difficulty',
        'status',
        'created_by',
        'meta_title',
        'meta_description',
        'meta_image',
        'certificate_template',
    ];

    protected function casts(): array
    {
        return [
            'certificate_template' => 'array',
        ];
    }

    public static function defaultCertificateTemplate(): array
    {
        return [
            'enabled'     => true,
            'size'        => 'a4',
            'orientation' => 'landscape',
            'background'  => [
                'type'      => 'color',
                'color'     => '#fdf8f4',
                'image_url' => '',
            ],
            'branding' => [
                'show_top_bar'    => true,
                'top_bar_color'   => '#8B1A4A',
                'show_bottom_bar' => true,
                'bottom_bar_color'=> '#8B1A4A',
                'accent_color'    => '#C8A96E',
                'show_logo'       => true,
                'logo_text'       => 'FENLearn',
                'tagline'         => 'FEN E-Learning Platform · Backed by FEN Network',
            ],
            'fields' => [
                ['id' => 'cert_label',        'label' => 'Certificate Label',  'type' => 'static',  'text' => 'Certificate of Completion',       'visible' => true,  'y' => 11, 'x' => 50, 'font_size' => 8,  'color' => '#8B1A4A', 'align' => 'center', 'bold' => false, 'italic' => false],
                ['id' => 'heading',           'label' => 'Main Heading',        'type' => 'static',  'text' => 'Certificate of Achievement',       'visible' => true,  'y' => 22, 'x' => 50, 'font_size' => 28, 'color' => '#1e1e2e', 'align' => 'center', 'bold' => true,  'italic' => false],
                ['id' => 'subheading',        'label' => 'Sub-heading',         'type' => 'static',  'text' => 'This is proudly presented to',     'visible' => true,  'y' => 34, 'x' => 50, 'font_size' => 10, 'color' => '#666666', 'align' => 'center', 'bold' => false, 'italic' => false],
                ['id' => 'recipient_name',    'label' => 'Recipient Name',      'type' => 'dynamic', 'text' => '',                                'visible' => true,  'y' => 46, 'x' => 50, 'font_size' => 34, 'color' => '#8B1A4A', 'align' => 'center', 'bold' => true,  'italic' => false],
                ['id' => 'body_text',         'label' => 'Body Text',           'type' => 'static',  'text' => 'for successfully completing the course', 'visible' => true, 'y' => 59, 'x' => 50, 'font_size' => 10, 'color' => '#555555', 'align' => 'center', 'bold' => false, 'italic' => false],
                ['id' => 'course_title',      'label' => 'Course Title',        'type' => 'dynamic', 'text' => '',                                'visible' => true,  'y' => 68, 'x' => 50, 'font_size' => 17, 'color' => '#1e1e2e', 'align' => 'center', 'bold' => true,  'italic' => false],
                ['id' => 'completion_date',   'label' => 'Completion Date',     'type' => 'dynamic', 'text' => '',                                'visible' => true,  'y' => 80, 'x' => 30, 'font_size' => 10, 'color' => '#555555', 'align' => 'center', 'bold' => false, 'italic' => false],
                ['id' => 'certificate_id',    'label' => 'Certificate ID',      'type' => 'dynamic', 'text' => '',                                'visible' => true,  'y' => 80, 'x' => 70, 'font_size' => 8,  'color' => '#888888', 'align' => 'center', 'bold' => false, 'italic' => false],
                ['id' => 'signatory_name',    'label' => 'Signatory Name',      'type' => 'dynamic', 'text' => '',                                'visible' => false, 'y' => 86, 'x' => 50, 'font_size' => 11, 'color' => '#1e1e2e', 'align' => 'center', 'bold' => true,  'italic' => false],
                ['id' => 'signatory_title',   'label' => 'Signatory Title',     'type' => 'dynamic', 'text' => '',                                'visible' => false, 'y' => 91, 'x' => 50, 'font_size' => 9,  'color' => '#666666', 'align' => 'center', 'bold' => false, 'italic' => false],
            ],
            'signatory'    => ['name' => '', 'title' => '', 'organization' => 'FEN Network'],
            'requirements' => ['type' => 'all_lessons', 'percentage' => 80, 'section_ids' => [], 'lesson_ids' => []],
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public function lessons(): HasManyThrough
    {
        return $this->hasManyThrough(Lesson::class, Section::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function getTotalLessonsAttribute(): int
    {
        return $this->lessons()->count();
    }
}
