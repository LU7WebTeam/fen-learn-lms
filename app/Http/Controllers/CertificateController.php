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

        $pdf = Pdf::loadView('pdf.certificate', [
            'name'         => $enrollment->user->name,
            'course_title' => $enrollment->course->title,
            'completed_at' => $enrollment->completed_at->format('F j, Y'),
            'uuid'         => $enrollment->certificate_uuid,
            'verify_url'   => $verifyUrl,
        ])->setPaper('a4', 'landscape');

        $filename = Str::slug($enrollment->course->title) . '-certificate.pdf';

        return $pdf->download($filename);
    }
}
