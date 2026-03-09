<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $keys = [
            'learner_can_enroll'         => '1',
            'editor_can_manage_users'    => '1',
            'editor_can_access_settings' => '1',
        ];

        foreach ($keys as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }

    public function down(): void
    {
        Setting::whereIn('key', [
            'learner_can_enroll',
            'editor_can_manage_users',
            'editor_can_access_settings',
        ])->delete();
    }
};
