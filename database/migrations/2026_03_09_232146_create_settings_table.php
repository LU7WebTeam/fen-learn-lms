<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 191)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $defaults = [
            'platform_name'              => 'Free LMS',
            'platform_tagline'           => 'Learn anything, anywhere.',
            'contact_email'              => '',
            'logo_path'                  => null,
            'favicon_path'               => null,
            'allow_registration'         => '1',
            'default_role'               => 'learner',
            'require_email_verification' => '0',
            'default_locale'             => 'en',
            'mail_driver'                => 'smtp',
            'mail_host'                  => '',
            'mail_port'                  => '587',
            'mail_username'              => '',
            'mail_password'              => '',
            'mail_sender_name'           => '',
            'mail_sender_address'        => '',
            'certificates_enabled'       => '1',
            'maintenance_mode'           => '0',
            'maintenance_message'        => 'We are currently down for scheduled maintenance. Please check back soon.',
        ];

        $now = now();
        foreach ($defaults as $key => $value) {
            DB::table('settings')->insert([
                'key'        => $key,
                'value'      => $value,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
