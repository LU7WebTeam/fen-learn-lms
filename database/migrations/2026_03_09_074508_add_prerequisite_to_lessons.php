<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->foreignId('prerequisite_lesson_id')
                  ->nullable()
                  ->after('is_free_preview')
                  ->constrained('lessons')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['prerequisite_lesson_id']);
            $table->dropColumn('prerequisite_lesson_id');
        });
    }
};
