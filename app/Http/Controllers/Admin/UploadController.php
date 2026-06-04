<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|image|max:8192',
        ]);

        $path = $request->file('file')->store('uploads', 's3');

        return response()->json([
            'url' => Storage::disk('s3')->url($path),
        ]);
    }
}
