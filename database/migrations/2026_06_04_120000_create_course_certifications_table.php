<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 120)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('priority')->default(100);
            $table->json('conditions_json');
            $table->json('template_json');
            $table->json('requirements_json');
            $table->timestamps();

            $table->index(['course_id', 'is_active']);
            $table->index(['course_id', 'priority']);
            $table->unique(['course_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_certifications');
    }
};
