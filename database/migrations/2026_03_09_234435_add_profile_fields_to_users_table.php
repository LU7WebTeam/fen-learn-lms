<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('avatar');
            $table->string('race')->nullable()->after('gender');
            $table->string('state')->nullable()->after('race');
            $table->date('birthdate')->nullable()->after('state');
            $table->string('occupation')->nullable()->after('birthdate');
            $table->string('organization')->nullable()->after('occupation');
            $table->timestamp('profile_completed_at')->nullable()->after('organization');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender', 'race', 'state', 'birthdate',
                'occupation', 'organization', 'profile_completed_at',
            ]);
        });
    }
};
