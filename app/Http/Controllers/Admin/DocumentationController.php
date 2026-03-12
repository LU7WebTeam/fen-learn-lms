<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminDocumentation;
use Inertia\Inertia;
use Inertia\Response;

class DocumentationController extends Controller
{
    public function index(?string $slug = null): Response
    {
        $documents = AdminDocumentation::all();

        abort_if(empty($documents), 404, 'No documentation files found.');

        $selectedDocument = $slug
            ? collect($documents)->firstWhere('slug', $slug)
            : $documents[0];

        abort_unless($selectedDocument, 404, 'Documentation page not found.');

        return Inertia::render('Admin/Documentation/Index', [
            'documentsByCategory' => AdminDocumentation::grouped(),
            'selectedDocument' => $selectedDocument,
        ]);
    }
}
