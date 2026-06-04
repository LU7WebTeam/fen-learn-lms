<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\EnrollmentCertification;
use App\Models\CustomFont;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Public verification page — anyone with the UUID can view.
     */
    public function show(string $uuid): \Inertia\Response
    {
        $issued = EnrollmentCertification::query()
            ->where('certificate_uuid', $uuid)
            ->with([
                'enrollment.user:id,name,organization',
                'enrollment.course:id,title,slug,category,certificate_template',
                'certification:id,name,template_json',
            ])
            ->first();

        if ($issued && $issued->enrollment && $issued->enrollment->completed_at) {
            $enrollment = $issued->enrollment;
            $template = $issued->template_snapshot_json
                ?? $issued->certification?->template_json
                ?? $enrollment->course->certificate_template
                ?? Course::defaultCertificateTemplate();

            $template = $this->applySignatoryFallbacks($template);
            $customFont = $this->resolveCustomFont($template);

            return Inertia::render('Certificate/Show', [
                'certificate' => [
                    'uuid' => $uuid,
                    'user_name' => $enrollment->user->name,
                    'course_title' => $enrollment->course->title,
                    'course_slug' => $enrollment->course->slug,
                    'category' => $enrollment->course->category,
                    'completed_at' => optional($enrollment->completed_at)->format('F j, Y') ?? optional($issued->issued_at)->format('F j, Y'),
                    'university_college' => $enrollment->user->organization,
                    'organization_name' => $enrollment->user->organization,
                    'download_url' => route('certificate.download', $uuid),
                ],
                'template' => $template,
                'customFont' => $customFont ? [
                    'id' => $customFont->id,
                    'family' => $customFont->family,
                    'regular_url' => $customFont->regular_path
                        ? asset('storage/' . $customFont->regular_path)
                        : null,
                ] : null,
            ]);
        }

        $enrollment = Enrollment::where('certificate_uuid', $uuid)
            ->whereNotNull('completed_at')
            ->with(['user:id,name,organization', 'course:id,title,slug,category,certificate_template'])
            ->firstOrFail();

        $template = $enrollment->course->certificate_template
            ?? Course::defaultCertificateTemplate();

        $template = $this->applySignatoryFallbacks($template);
        $customFont = $this->resolveCustomFont($template);

        return Inertia::render('Certificate/Show', [
            'certificate' => [
                'uuid'         => $enrollment->certificate_uuid,
                'user_name'    => $enrollment->user->name,
                'course_title' => $enrollment->course->title,
                'course_slug'  => $enrollment->course->slug,
                'category'     => $enrollment->course->category,
                'completed_at' => $enrollment->completed_at->format('F j, Y'),
                'university_college' => $enrollment->user->organization,
                'organization_name' => $enrollment->user->organization,
                'download_url' => route('certificate.download', $enrollment->certificate_uuid),
            ],
            'template'    => $template,
            'customFont'  => $customFont ? [
                'id'          => $customFont->id,
                'family'      => $customFont->family,
                'regular_url' => $customFont->regular_path
                    ? asset('storage/' . $customFont->regular_path)
                    : null,
            ] : null,
        ]);
    }

    /**
     * Download the PDF certificate — public, anyone with the UUID can download.
     */
    public function download(string $uuid): Response
    {
        $issued = EnrollmentCertification::query()
            ->where('certificate_uuid', $uuid)
            ->with([
                'enrollment.user:id,name,organization',
                'enrollment.course:id,title,slug,category,certificate_template',
                'certification:id,name,template_json',
            ])
            ->first();

        if ($issued && $issued->enrollment && $issued->enrollment->completed_at) {
            $enrollment = $issued->enrollment;
            $verifyUrl = config('app.url') . '/certificate/' . $uuid;

            $template = $issued->template_snapshot_json
                ?? $issued->certification?->template_json
                ?? $enrollment->course->certificate_template
                ?? Course::defaultCertificateTemplate();

            $template = $this->applySignatoryFallbacks($template);
            $customFont = $this->resolveCustomFont($template);
            $size = $template['size'] ?? 'a4';
            $orientation = $template['orientation'] ?? 'landscape';

            $options = app(\Barryvdh\DomPDF\PDF::class)->getOptions();
            $options->setIsRemoteEnabled(true);

            $pdf = Pdf::loadView('pdf.certificate', [
                'template' => $template,
                'customFont' => $customFont,
                'name' => $enrollment->user->name,
                'course_title' => $enrollment->course->title,
                'completed_at' => optional($enrollment->completed_at)->format('F j, Y') ?? optional($issued->issued_at)->format('F j, Y'),
                'uuid' => $uuid,
                'university_college' => $enrollment->user->organization,
                'organization_name' => $enrollment->user->organization,
                'verify_url' => $verifyUrl,
            ])->setPaper($size, $orientation);

            $filename = Str::slug($enrollment->course->title) . '-certificate.pdf';

            return $pdf->download($filename);
        }

        $enrollment = Enrollment::where('certificate_uuid', $uuid)
            ->whereNotNull('completed_at')
            ->with(['user:id,name,organization', 'course:id,title,slug,certificate_template'])
            ->firstOrFail();

        $verifyUrl = config('app.url') . '/certificate/' . $uuid;

        $template = $enrollment->course->certificate_template
            ?? Course::defaultCertificateTemplate();

        $template = $this->applySignatoryFallbacks($template);
        $customFont = $this->resolveCustomFont($template);

        $size        = $template['size']        ?? 'a4';
        $orientation = $template['orientation'] ?? 'landscape';

        $options = app(\Barryvdh\DomPDF\PDF::class)->getOptions();
        $options->setIsRemoteEnabled(true);

        $pdf = Pdf::loadView('pdf.certificate', [
            'template'     => $template,
            'customFont'   => $customFont,
            'name'         => $enrollment->user->name,
            'course_title' => $enrollment->course->title,
            'completed_at' => $enrollment->completed_at->format('F j, Y'),
            'uuid'         => $enrollment->certificate_uuid,
            'university_college' => $enrollment->user->organization,
            'organization_name' => $enrollment->user->organization,
            'verify_url'   => $verifyUrl,
        ])->setPaper($size, $orientation);

        $filename = Str::slug($enrollment->course->title) . '-certificate.pdf';

        return $pdf->download($filename);
    }

    private function applySignatoryFallbacks(array $template): array
    {
        $signatory = $template['signatory'] ?? [];
        $template['fields'] = collect($template['fields'] ?? [])
            ->map(function ($field) use ($signatory) {
                if ($field['id'] === 'signatory_name' && empty($field['text'])) {
                    $field['text'] = $signatory['name'] ?? '';
                }
                if ($field['id'] === 'signatory_title' && empty($field['text'])) {
                    $field['text'] = $signatory['title'] ?? '';
                }
                return $field;
            })->all();

        return $template;
    }

    private function resolveCustomFont(array $template): ?CustomFont
    {
        $customFontId = $template['custom_font_id'] ?? null;

        if (! $customFontId) {
            return null;
        }

        return CustomFont::query()->where('is_active', true)->find($customFontId);
    }
}
