<?php

use App\Http\Controllers\Admin\CoursesController as AdminCoursesController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\LessonsController as AdminLessonsController;
use App\Http\Controllers\Admin\SectionsController as AdminSectionsController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Public certificate verification + download (no auth required — UUID is the access key)
Route::get('/certificate/{uuid}', [CertificateController::class, 'show'])->name('certificate.show');
Route::get('/certificate/{uuid}/download', [CertificateController::class, 'download'])->name('certificate.download');

// Locale switcher
Route::post('/locale', [LocaleController::class, 'set'])->name('locale.set');

// Public course catalog + detail (auth optional)
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Enrollment + course player
    Route::post('/courses/{course:slug}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');
    Route::get('/learn/{course:slug}', [LearnController::class, 'index'])->name('learn.index');
    Route::get('/learn/{course:slug}/lesson/{lesson}', [LearnController::class, 'show'])->name('learn.lesson');
    Route::post('/learn/{course:slug}/lesson/{lesson}/complete', [LearnController::class, 'complete'])->name('learn.complete');
    Route::post('/learn/{course:slug}/lesson/{lesson}/quiz',    [LearnController::class, 'submitQuiz'])->name('learn.quiz.submit');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Courses
    Route::resource('courses', AdminCoursesController::class)->except(['show']);
    Route::patch('/courses/{course}/certificate', [AdminCoursesController::class, 'updateCertificate'])->name('courses.certificate.update');
    Route::patch('/courses/{course}/introduction', [AdminCoursesController::class, 'updateIntroduction'])->name('courses.introduction.update');

    // Users
    Route::get('/users', [\App\Http\Controllers\Admin\UsersController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UsersController::class, 'updateRole'])->name('users.update-role');

    // Sections (nested under a course)
    Route::post('/courses/{course}/sections', [AdminSectionsController::class, 'store'])->name('courses.sections.store');
    Route::patch('/courses/{course}/sections/reorder', [AdminSectionsController::class, 'reorder'])->name('courses.sections.reorder');
    Route::patch('/sections/{section}', [AdminSectionsController::class, 'update'])->name('sections.update');
    Route::delete('/sections/{section}', [AdminSectionsController::class, 'destroy'])->name('sections.destroy');

    // Media uploads (quick AJAX endpoints returning JSON)
    Route::post('/upload-image', [\App\Http\Controllers\Admin\UploadController::class, 'image'])->name('upload.image');

    // Lessons (nested under a section)
    Route::post('/sections/{section}/lessons', [AdminLessonsController::class, 'store'])->name('sections.lessons.store');
    Route::patch('/sections/{section}/lessons/reorder', [AdminLessonsController::class, 'reorder'])->name('sections.lessons.reorder');
    Route::get('/lessons/{lesson}/edit', [AdminLessonsController::class, 'edit'])->name('lessons.edit');
    Route::patch('/lessons/{lesson}', [AdminLessonsController::class, 'update'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [AdminLessonsController::class, 'destroy'])->name('lessons.destroy');
});

require __DIR__.'/auth.php';
