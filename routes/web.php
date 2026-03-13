<?php

use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\Admin\InvitationsController as AdminInvitationsController;
use App\Http\Controllers\Admin\CustomFontController;
use App\Http\Controllers\Admin\ActivityLogsController as AdminActivityLogsController;
use App\Http\Controllers\Admin\CoursesController as AdminCoursesController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DocumentationController as AdminDocumentationController;
use App\Http\Controllers\Admin\LessonsController as AdminLessonsController;
use App\Http\Controllers\Admin\SectionsController as AdminSectionsController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
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

// Static / legal pages
Route::get('/about',   fn () => inertia('Legal/About'))->name('about');
Route::get('/terms',   fn () => inertia('Legal/Terms'))->name('terms');
Route::get('/privacy', fn () => inertia('Legal/Privacy'))->name('privacy');

// Staff invitation acceptance (public — token is the auth)
Route::get('/invite/{token}', [\App\Http\Controllers\Admin\InvitationsController::class, 'show'])
    ->name('invitations.show');
Route::post('/invite/{token}', [\App\Http\Controllers\Admin\InvitationsController::class, 'accept'])
    ->name('invitations.accept');

// Public course catalog + detail (auth optional)
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile setup (onboarding) — must come before profile.complete middleware routes
    Route::get('/profile-setup', [ProfileSetupController::class, 'show'])->name('profile.setup');
    Route::post('/profile-setup', [ProfileSetupController::class, 'store'])->name('profile.setup.store');
});

Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
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
    Route::get('/docs/{slug?}', [AdminDocumentationController::class, 'index'])->name('docs.index');
    Route::get('/activity-logs', [AdminActivityLogsController::class, 'index'])->name('activity-logs.index');
    Route::get('/activity-logs/controls', [AdminActivityLogsController::class, 'controls'])->name('activity-logs.controls');
    Route::get('/activity-logs/export', [AdminActivityLogsController::class, 'export'])->name('activity-logs.export');
    Route::get('/activity-logs/export-json', [AdminActivityLogsController::class, 'exportJson'])->name('activity-logs.export-json');
    Route::post('/activity-logs/settings', [AdminActivityLogsController::class, 'updateSettings'])->name('activity-logs.settings.update');
    Route::post('/activity-logs/prune', [AdminActivityLogsController::class, 'pruneNow'])->name('activity-logs.prune');

    // Courses
    Route::resource('courses', AdminCoursesController::class)->except(['show']);
    Route::patch('/courses/{course}/certificate', [AdminCoursesController::class, 'updateCertificate'])->name('courses.certificate.update');
    Route::patch('/courses/{course}/introduction', [AdminCoursesController::class, 'updateIntroduction'])->name('courses.introduction.update');

    // Users
    Route::get('/users', [\App\Http\Controllers\Admin\UsersController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UsersController::class, 'updateRole'])->name('users.update-role');

    // Staff invitations
    Route::post('/invitations', [AdminInvitationsController::class, 'store'])->name('invitations.store');

    // User suspension
    Route::patch('/users/{user}/suspend',   [\App\Http\Controllers\Admin\UsersController::class, 'suspend'])->name('users.suspend');
    Route::patch('/users/{user}/unsuspend', [\App\Http\Controllers\Admin\UsersController::class, 'unsuspend'])->name('users.unsuspend');

    // User profile (JSON for popup)
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\UsersController::class, 'show'])->name('users.show');

    // User profile editing
    Route::patch('/users/{user}/profile', [\App\Http\Controllers\Admin\UsersController::class, 'updateProfile'])->name('users.update-profile');

    // Sections (nested under a course)
    Route::post('/courses/{course}/sections', [AdminSectionsController::class, 'store'])->name('courses.sections.store');
    Route::patch('/courses/{course}/sections/reorder', [AdminSectionsController::class, 'reorder'])->name('courses.sections.reorder');
    Route::patch('/sections/{section}', [AdminSectionsController::class, 'update'])->name('sections.update');
    Route::delete('/sections/{section}', [AdminSectionsController::class, 'destroy'])->name('sections.destroy');
    Route::post('/sections/{section}/duplicate', [AdminSectionsController::class, 'duplicate'])->name('sections.duplicate');

    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/test-email', [AdminSettingsController::class, 'testEmail'])->name('settings.test-email');
    Route::post('/settings/test-email/{type}', [AdminSettingsController::class, 'testTemplateEmail'])->name('settings.test-email-template');
    Route::post('/settings/fonts', [CustomFontController::class, 'store'])->name('settings.fonts.store');
    Route::delete('/settings/fonts/{font}', [CustomFontController::class, 'destroy'])->name('settings.fonts.destroy');

    // Media uploads (quick AJAX endpoints returning JSON)
    Route::post('/upload-image', [\App\Http\Controllers\Admin\UploadController::class, 'image'])->name('upload.image');

    // Lessons (nested under a section)
    Route::post('/sections/{section}/lessons', [AdminLessonsController::class, 'store'])->name('sections.lessons.store');
    Route::patch('/sections/{section}/lessons/reorder', [AdminLessonsController::class, 'reorder'])->name('sections.lessons.reorder');
    Route::get('/lessons/{lesson}/edit', [AdminLessonsController::class, 'edit'])->name('lessons.edit');
    Route::patch('/lessons/{lesson}', [AdminLessonsController::class, 'update'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [AdminLessonsController::class, 'destroy'])->name('lessons.destroy');
    Route::post('/lessons/{lesson}/duplicate', [AdminLessonsController::class, 'duplicate'])->name('lessons.duplicate');
    Route::post('/courses/{course}/duplicate', [AdminCoursesController::class, 'duplicate'])->name('courses.duplicate');
});

require __DIR__.'/auth.php';
