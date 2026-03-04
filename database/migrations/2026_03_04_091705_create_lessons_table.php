<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['video', 'text', 'pdf', 'quiz'])->default('video');
            $table->text('content')->nullable();
            $table->string('video_url')->nullable();
            $table->string('pdf_url')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->boolean('is_free_preview')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
