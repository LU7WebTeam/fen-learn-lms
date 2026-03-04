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
      Auth/                     # Breeze auth pages (Login, Register, etc.)
      Profile/                  # Profile edit (Breeze)
  css/
    app.css                     # Tailwind + Shadcn CSS variables (light/dark)
app/
  Http/
    Controllers/
      DashboardController.php         # Learner dashboard
      Admin/DashboardController.php   # Admin dashboard
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
4. Public Pages — Home/Landing, Course Catalog, Course Detail, Static pages
5. Course Player — Lesson viewer (video/text/PDF), curriculum sidebar, progress tracking
6. Quiz System — MCQ builder, auto-grading, pass/fail feedback
7. Certificate Generation — PDF certificate on 100% completion
8. Admin CRUD — Course builder, curriculum drag-and-drop, user management
9. Media Upload — S3 integration for videos/PDFs
10. SEO Settings — Per-course meta tags
