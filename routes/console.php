<?php

use App\Support\ActivityLogPruner;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('activity-logs:prune {--days=} {--archive=}', function (ActivityLogPruner $pruner) {
    $days = $this->option('days');
    $archive = $this->option('archive');

    $summary = $pruner->pruneFromSettings(
        $days !== null ? (int) $days : null,
        $archive !== null ? in_array((string) $archive, ['1', 'true', 'yes'], true) : null,
    );

    $this->info('Prune complete. Deleted '.$summary['deleted_count'].' log(s).');
    if (! empty($summary['archive_path'])) {
        $this->info('Archive saved to: '.$summary['archive_path']);
    }
})->purpose('Prune old admin activity logs using retention settings');

Schedule::command('activity-logs:prune')->dailyAt('02:15');
