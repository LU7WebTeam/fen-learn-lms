<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('title_ms')->nullable()->after('title');
            $table->text('description_ms')->nullable()->after('description');
            $table->json('introduction_ms')->nullable()->after('introduction');
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->string('title_ms')->nullable()->after('title');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->string('title_ms')->nullable()->after('title');
            $table->text('content_ms')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['title_ms', 'description_ms', 'introduction_ms']);
        });
        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn('title_ms');
        });
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['title_ms', 'content_ms']);
        });
    }
};
