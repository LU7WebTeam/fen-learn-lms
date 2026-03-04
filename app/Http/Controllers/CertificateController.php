<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
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
        $enrollment = Enrollment::where('certificate_uuid', $uuid)
            ->whereNotNull('completed_at')
            ->with(['user:id,name', 'course:id,title,slug,category'])
            ->firstOrFail();

        return Inertia::render('Certificate/Show', [
            'certificate' => [
                'uuid'         => $enrollment->certificate_uuid,
                'user_name'    => $enrollment->user->name,
                'course_title' => $enrollment->course->title,
                'course_slug'  => $enrollment->course->slug,
                'category'     => $enrollment->course->category,
                'completed_at' => $enrollment->completed_at->format('F j, Y'),
                'download_url' => route('certificate.download', $enrollment->certificate_uuid),
            ],
        ]);
    }

    /**
     * Download the PDF certificate — public, anyone with the UUID can download.
     */
    public function download(string $uuid): Response
    {
        $enrollment = Enrollment::where('certificate_uuid', $uuid)
            ->whereNotNull('completed_at')
            ->with(['user:id,name', 'course:id,title,slug'])
            ->firstOrFail();

        $verifyUrl = config('app.url') . '/certificate/' . $enrollment->certificate_uuid;

        $template = $enrollment->course->certificate_template
            ?? \App\Models\Course::defaultCertificateTemplate();

        $size        = $template['size']        ?? 'a4';
        $orientation = $template['orientation'] ?? 'landscape';

        // Fill dynamic signatory fields into the template fields list
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

        $options = app(\Barryvdh\DomPDF\PDF::class)->getOptions();
        $options->setIsRemoteEnabled(true);

        $pdf = Pdf::loadView('pdf.certificate', [
            'template'     => $template,
            'name'         => $enrollment->user->name,
            'course_title' => $enrollment->course->title,
            'completed_at' => $enrollment->completed_at->format('F j, Y'),
            'uuid'         => $enrollment->certificate_uuid,
            'verify_url'   => $verifyUrl,
        ])->setPaper($size, $orientation);

        $filename = Str::slug($enrollment->course->title) . '-certificate.pdf';

        return $pdf->download($filename);
    }
}
