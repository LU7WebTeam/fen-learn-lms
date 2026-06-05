<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $lessons = DB::table('lessons')
            ->whereNotNull('content')
            ->orWhereNotNull('content_ms')
            ->get(['id', 'content', 'content_ms']);

        foreach ($lessons as $lesson) {
            $changed = false;
            $updates = [];

            foreach (['content', 'content_ms'] as $col) {
                $raw = $lesson->$col;
                if ($raw === null) {
                    continue;
                }

                $data = json_decode($raw, true);
                if (!is_array($data) || empty($data['questions'])) {
                    continue;
                }

                $colChanged = false;
                foreach ($data['questions'] as &$q) {
                    foreach (['text', 'question_text', 'question'] as $textKey) {
                        if (isset($q[$textKey]) && is_string($q[$textKey]) && str_contains($q[$textKey], "\\n")) {
                            $q[$textKey] = str_replace("\\n", '', $q[$textKey]);
                            $colChanged  = true;
                        }
                    }
                    if (!empty($q['options'])) {
                        foreach ($q['options'] as &$opt) {
                            if (is_array($opt) && isset($opt['label']) && is_string($opt['label']) && str_contains($opt['label'], "\\n")) {
                                $opt['label'] = str_replace("\\n", '', $opt['label']);
                                $colChanged   = true;
                            } elseif (is_string($opt) && str_contains($opt, "\\n")) {
                                $opt        = str_replace("\\n", '', $opt);
                                $colChanged = true;
                            }
                        }
                        unset($opt);
                    }
                }
                unset($q);

                if ($colChanged) {
                    $updates[$col] = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    $changed       = true;
                }
            }

            if ($changed) {
                DB::table('lessons')->where('id', $lesson->id)->update($updates);
            }
        }
    }

    public function down(): void
    {
        // Data-only migration; cannot restore stripped characters.
    }
};
