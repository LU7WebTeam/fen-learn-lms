<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SystemLogReader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SystemLogsController extends Controller
{
    public function index(Request $request, SystemLogReader $reader): Response
    {
        $this->authorizeView($request);

        $filters = $this->filtersFromRequest($request);
        $entries = $reader->read($filters);

        $page = max(1, (int) $request->integer('page', 1));
        $perPage = 50;

        $paginator = new LengthAwarePaginator(
            $entries->slice(($page - 1) * $perPage, $perPage)->values(),
            $entries->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Admin/SystemLogs/Index', [
            'logs' => $paginator,
            'filters' => $filters,
            'options' => [
                'levels' => $reader->availableLevels(),
            ],
        ]);
    }

    public function export(Request $request, SystemLogReader $reader): StreamedResponse|JsonResponse
    {
        $this->authorizeView($request);

        $filters = $this->filtersFromRequest($request);
        $entries = $reader->read($filters);
        $format = $request->input('format', 'csv');

        if ($format === 'json') {
            return response()->json([
                'exported_at' => now()->toIso8601String(),
                'filters' => $filters,
                'count' => $entries->count(),
                'data' => $entries,
            ]);
        }

        $filename = 'system-logs-'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($entries, $filters) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['# exported_at', now()->toIso8601String()]);
            fputcsv($handle, ['# filters', json_encode($filters, JSON_UNESCAPED_UNICODE)]);
            fputcsv($handle, []);
            fputcsv($handle, ['timestamp', 'level', 'message', 'request_id', 'user_id', 'route_name', 'request_path', 'request_method', 'request_ip', 'source_file', 'context_json']);

            foreach ($entries as $entry) {
                fputcsv($handle, [
                    $entry['timestamp_raw'],
                    $entry['level'],
                    $entry['message'],
                    $entry['request_id'],
                    $entry['user_id'],
                    $entry['route_name'],
                    $entry['request_path'],
                    $entry['request_method'],
                    $entry['request_ip'],
                    $entry['source_file'],
                    json_encode($entry['context'], JSON_UNESCAPED_UNICODE),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function authorizeView(Request $request): void
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Only super admins can access system logs.');
        }
    }

    private function filtersFromRequest(Request $request): array
    {
        $validated = $request->validate([
            'level' => ['nullable', 'in:debug,info,warning,error'],
            'search' => ['nullable', 'string', 'max:255'],
            'request_id' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        return [
            'level' => $validated['level'] ?? '',
            'search' => $validated['search'] ?? '',
            'request_id' => $validated['request_id'] ?? '',
            'user_id' => isset($validated['user_id']) ? (string) $validated['user_id'] : '',
            'date_from' => $validated['date_from'] ?? '',
            'date_to' => $validated['date_to'] ?? '',
        ];
    }
}
