<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    public static function record(
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?string $event = null,
        string $logName = 'admin',
    ): void {
        $logger = activity($logName);

        if (auth()->check()) {
            $logger->causedBy(auth()->user());
        }

        if ($subject) {
            $logger->performedOn($subject);
        }

        if (! empty($properties)) {
            $logger->withProperties($properties);
        }

        if ($event) {
            $logger->event($event);
        }

        $logger->log($description);
    }

    public static function changedFields(array $before, array $after): array
    {
        $changed = [];

        foreach ($after as $key => $value) {
            if (($before[$key] ?? null) !== $value) {
                $changed[] = $key;
            }
        }

        return $changed;
    }
}