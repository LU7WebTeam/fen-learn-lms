<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollment_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_certification_id')->constrained()->cascadeOnDelete();
            $table->string('certificate_uuid', 191)->unique();
            $table->timestamp('issued_at')->useCurrent();
            $table->json('template_snapshot_json');
            $table->json('recipient_snapshot_json')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'course_certification_id']);
            $table->index(['course_certification_id', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_certifications');
    }
};
