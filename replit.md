# Free Public LMS

A free, high-performance Learning Management System built for the public. Delivers video, text, and auto-graded quiz content with progress tracking and automated PDF certificates upon completion.

## Tech Stack

- **Backend:** Laravel 12.x (PHP 8.4)
- **Frontend:** React 19.x
- **Bridge:** Inertia.js (SPA routing)
- **Auth Scaffold:** Laravel Breeze (React + Inertia)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (all components in `resources/js/Components/ui/`)
- **Database:** SQLite (local dev) / MySQL (cPanel production)

## Project Structure

```
resources/
  js/
    Components/
      ui/           # Shadcn UI components (button, card, badge, etc.)
    hooks/          # use-toast
    lib/            # cn utility
    Layouts/
      AuthenticatedLayout.jsx   # Learner nav with Shadcn DropdownMenu + Sheet
      AdminLayout.jsx           # Admin sidebar layout
      GuestLayout.jsx           # Login/register layout (Breeze)
    Pages/
      Learner/Dashboard.jsx     # /dashboard — in-progress + completed courses
      Admin/Dashboard.jsx       # /admin/dashboard — metric cards + recent courses
      Admin/Courses/
        Index.jsx               # /admin/courses — paginated course table
        Create.jsx              # /admin/courses/create — new course form
        Edit.jsx                # /admin/courses/{id}/edit — details + curriculum builder
      Admin/Lessons/
        Edit.jsx                # /admin/lessons/{id}/edit — video/text/quiz editor
      Courses/
        Index.jsx               # /courses — public catalog with filters
        Show.jsx                # /courses/{slug} — detail, curriculum, enroll
      Learn/
        Show.jsx                # /learn/{slug}/lesson/{id} — full lesson player
      Auth/                     # Breeze auth pages (Login, Register, etc.)
      Profile/                  # Profile edit (Breeze)
  css/
    app.css                     # Tailwind + Shadcn CSS variables (light/dark)
app/
  Http/
    Controllers/
      DashboardController.php         # Learner dashboard (redirects admins)
      Admin/DashboardController.php   # Admin dashboard metrics
      Admin/CoursesController.php     # Course CRUD (index/create/store/edit/update/destroy)
      Admin/SectionsController.php    # Section CRUD + reorder
      Admin/LessonsController.php     # Lesson CRUD + reorder + content editor
      CourseController.php            # Public catalog + course detail page
      EnrollmentController.php        # Enroll in a course, resume from last lesson
      LearnController.php             # Lesson player + mark-complete + completion check
      ProfileController.php           # Profile management (Breeze)
    Middleware/
      EnsureUserIsAdmin.php           # Blocks non-admin users from /admin/*
      HandleInertiaRequests.php       # Shares auth.user with all pages
  Models/
    User.php          # role (learner|content_editor|super_admin), avatar
    Course.php        # title, slug, description, category, difficulty, status
    Section.php       # belongs to Course, ordered
    Lesson.php        # type (video|text|pdf|quiz), belongs to Section
    Enrollment.php    # user-course pivot with completion + certificate_uuid
    LessonProgress.php # per-lesson completion tracking
database/
  migrations/         # All 9 migrations (users, courses, sections, lessons, enrollments, progress)
routes/
  web.php             # Learner + admin routes with middleware
  auth.php            # Breeze auth routes
```

## Database Configuration

- **Development (Replit):** SQLite — auto-migrates on startup
- **Production (cPanel):** MySQL — set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

## RBAC Roles

- `learner` — default role for all registrations
- `content_editor` — can manage courses (admin panel access)
- `super_admin` — full access including platform settings

## Admin Access

- **Admin middleware:** `admin` alias → `EnsureUserIsAdmin`
- **Admin routes:** `/admin/*` protected by `auth + verified + admin` middleware
- To make a user an admin, set `role` to `super_admin` in the DB

## Test Credentials (dev)

- **Admin:** admin@lms.test / password

## Development Workflow

The `start.sh` script starts both:
1. Auto-runs migrations on startup
2. Vite dev server on port 5173 (HMR)
3. PHP artisan serve on port 5000 (main server)

## Shadcn UI Components

All PRD-mapped components in `resources/js/Components/ui/`:
`button`, `card`, `badge`, `progress`, `accordion`, `checkbox`, `separator`,
`radio-group`, `alert`, `dialog`, `tabs`, `table`, `toast`, `navigation-menu`,
`sheet`, `dropdown-menu`, `select`, `toggle-group`, `input`, `label`, `avatar`

## Features Roadmap (per PRD)

1. **Foundation** ✅ — Project scaffold, Tailwind, Shadcn UI, dev/prod DB config
2. **Auth** ✅ — Email/password (Breeze), RBAC roles, admin middleware
3. **Dashboard Pages** ✅ — Learner dashboard + Admin dashboard with layouts
4. **Course Builder (Admin)** ✅ — Course CRUD, section/lesson management, video/text/quiz editors
5. **Course Player** ✅ — Catalog, course detail, enrollment, lesson player (video/text/quiz), progress tracking
6. **Certificate Generation** ✅ — PDF (landscape A4) on 100% completion, public verification page, download button in player + dashboard
   - Certificate Builder ✅ — Per-course template: size/orientation, background (color/image), branding (bars/logo/colors), field placement (10 fields with y%, font, color, bold/italic, align), signatory, requirements (all/percentage/sections/lessons)
7. **User Management** ✅ — Admin user list, student/staff tabs, role editing dialog
8. **Quiz Feature** ✅ — Server-side graded quizzes, hidden correct answers, attempt storage, pass/fail with configurable score, per-question feedback, retry support
9. **Media Uploads** ✅ — Course cover images (drag & drop, preview, replace/clear), video lesson file upload (toggle URL ↔ upload), PDF lesson type with file upload + inline viewer; old files auto-deleted on replace
   - Files stored in `storage/app/public/` (covers/, videos/, pdfs/) served via `/storage/` symlink
   - Components: `ImageUpload.jsx`, `PdfUpload.jsx`
10. **Bilingual Support (EN + Bahasa Melayu)** ✅
11. **Platform Settings** ✅ — Admin settings page with 6 groups: Branding, Registration & Access, Localization, Email/SMTP, Certificates, Maintenance
    - Settings stored in `settings` key-value table via `Setting` model
    - Branding: platform name, tagline, contact email, logo + favicon upload (`storage/app/public/branding/`)
    - Registration: allow_registration toggle, default role, email verification toggle
    - Localization: default platform language (EN/BM)
    - Email/SMTP: mail driver, host, port, credentials, sender — applied dynamically via `AppServiceProvider`
    - Certificates: global enable/disable override
    - Maintenance: toggle + custom message → non-admins see `resources/views/maintenance.blade.php` (503)
    - `HandleMaintenanceMode` middleware bypasses admins and auth routes
    - `RegisteredUserController` respects `allow_registration`, `default_role`, `require_email_verification` settings
    - `HandleInertiaRequests` shares `platform` prop (name, tagline, logo_url, favicon_url) to all pages
    - Public helper `tl(record, field, locale)` in `resources/js/lib/locale.js` — returns BM field if non-empty, else falls back to EN
    - `LangSwitcher.jsx` component in `AuthenticatedLayout` and `Learn/Show` header
    - All public pages (`Courses/Index`, `Courses/Show`, `Learn/Show`) fully localized with EN fallback
