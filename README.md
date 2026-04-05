# Fen Learn LMS

A free, high-performance Learning Management System built for public access. Delivers video, text, and auto-graded quiz content with progress tracking and automated PDF certificates upon completion.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.4) |
| Frontend | React 19 |
| Bridge | Inertia.js (SPA routing, no separate API) |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| Database | SQLite (development) / MySQL (production) |
| Auth Scaffold | Laravel Breeze |

---

## Features

### Learner Experience
- Public course catalog with search and difficulty filters
- Course detail page with full curriculum preview
- Per-course activity history for enrolled learners (event, lesson/item, result, timestamp)
- One-click enrollment and resume from last lesson
- Full lesson player — video, rich text, PDF, and auto-graded quizzes
- Per-lesson progress tracking
- Automated PDF certificate generation on course completion
- Bilingual interface — English and Bahasa Melayu with live language switcher
- Learner profile builder (gender, race, state, date of birth, occupation, organization)

### Admin Panel
- Platform dashboard with key metrics (enrollments, completions, active learners)
- Course builder with sections, lessons, and drag-and-drop reorder
- Lesson editor — video URL or file upload, rich text (BlockNote), PDF upload, quiz builder
- Per-course dashboard — enrollment stats, per-student progress, lesson completion rates
- Learner profile popup with inline edit directly from the course dashboard or users table
- User management — students and staff in a single tabbed view
- Staff invitation system — email invite with role pre-assignment and 7-day expiry
- Course Viewer role — read-only course access scoped to assigned courses
- Account suspension with reason logging
- Super-admin password reset controls — set new password directly or send reset link
- Platform settings — branding, registration controls, SMTP, localization, maintenance mode
- Bilingual system emails with BM primary content and EN secondary fallback
- Certificate template builder per course (toggle on/off, custom layout)
- SEO metadata per course — title, description, Open Graph image
- Static legal pages (About, Terms, Privacy)

### Access Control

| Role | Access |
|---|---|
| `learner` | Public catalog, enrolled courses, own profile |
| `course_viewer` | Admin panel read-only view of assigned courses only |
| `content_editor` | Admin panel — courses and lessons only |
| `super_admin` | Full access including users, settings, invitations |

- Separate login pages for learners (`/login`) and staff/admins (`/admin/login`)
- Email-based 2FA verification code for learner and staff/admin login (configurable via `TWO_FACTOR_ENABLED`)
- New learners must complete their profile before accessing any content
- Maintenance mode — toggleable from settings, transparently bypasses admins

---

## Local Development

### Requirements
- PHP 8.4+
- Composer
- Node.js 20+

### Setup

```bash
git clone https://github.com/LU7WebTeam/fen-learn-lms.git
cd fen-learn-lms

cp .env.example .env

composer install
php artisan key:generate
php artisan migrate --seed

npm install
npm run dev
```

Open `http://localhost:8000` in your browser.

Landing routes:
- `/` renders the current landing page (`Landing/Home`)
- `/backup-landing` renders the backup welcome page (`Welcome`)

**Seeded admin credentials:**
- Email: `admin@lms.test`
- Password: `password`

---

## New Developer Quickstart

Use this checklist when joining the project or resuming work after a break.

### 1. First-time local setup

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install
```

Start services:

```bash
php artisan serve
npm run dev
```

### 2. Daily development workflow

1. Pull latest from `main`.
2. Make code/content/i18n changes.
3. Run targeted checks locally (and full checks before push when needed).
4. If frontend output changed, run `npm run build` and include `public/build` updates in commit.
5. Push to `main` (or your working branch/PR flow if your team adopts one).

### 3. Known build notes

- `vite build` currently shows non-blocking CSS minify warnings (unterminated string token) and chunk size warnings.
- These warnings are expected in current state when build exits successfully.
- Treat build as failed only when `npm run build` returns a non-zero exit code.

### 4. Translation and localization notes

- Static UI translations live in:
  - `resources/js/i18n/en.json`
  - `resources/js/i18n/ms.json`
- Localized content fields use `*_ms` values with fallback behavior (`tl(...)`) when BM content is missing.
- Frontend translation changes require rebuilding assets (`npm run build`) and committing updated `public/build` files.

### 5. Documentation rule

- Update relevant docs in `docs/admin/*.md` in the same commit as feature or workflow changes.

---

## Production Deployment (cPanel)

### 1. Set environment variables on the server

Copy `.env.example` to `.env` and configure:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Fen Learn"
```

Then run:
```bash
php artisan key:generate
php artisan storage:link
```

### 2. Build and commit frontend assets

Production does not run `npm`, so any frontend or translation changes must be built locally and committed before deployment:

```bash
npm run build
git add public/build
git commit -m "Build frontend assets"
```

Build warnings (for example, current CSS minify and chunk size warnings) are non-blocking when `vite build` exits successfully.

### 3. GitHub Actions CI/CD

Every push to `main` automatically:
1. Installs Composer dependencies (production, no dev)
2. Builds frontend assets (`npm run build`)
3. Rsyncs all files to the cPanel server over SSH
4. Runs migrations, clears and rebuilds all caches, re-links storage

#### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** in the repo and add:

| Secret | Description | Example |
|---|---|---|
| `SSH_HOST` | Server hostname or IP | `yourdomain.com` |
| `SSH_PORT` | SSH port | `22` |
| `SSH_USER` | cPanel username | `fenlearn` |
| `SSH_PRIVATE_KEY` | Full private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | Absolute path on server | `/home/fenlearn/public_html` |

Add the matching public key in **cPanel → Security → SSH Access → Manage Keys → Authorize**.

---

## Project Structure

```
app/
  Http/
    Controllers/
      Admin/                      # Courses, Lessons, Sections, Users, Settings, Invitations
      CourseController.php        # Public catalog and course detail
      EnrollmentController.php    # Enroll and resume
      LearnController.php         # Lesson player and progress tracking
    Middleware/
      EnsureUserIsAdmin.php
      EnsureProfileIsComplete.php
      HandleMaintenanceMode.php
  Models/
    User, Course, Section, Lesson, Enrollment, LessonProgress, Setting

resources/
  js/
    Pages/
      Admin/                      # Dashboard, Courses, Users, Settings
      Learner/                    # Dashboard
      Courses/                    # Public catalog and detail
      Learn/                      # Lesson player
      Auth/                       # Login, Register, ProfileSetup, AcceptInvitation
    Components/ui/                # Shadcn UI components
    Layouts/                      # AdminLayout, AuthenticatedLayout, GuestLayout

database/
  migrations/                     # 9 migrations
  seeders/                        # AdminSeeder

.github/
  workflows/
    deploy.yml                    # CI/CD — build + rsync + post-deploy
```

---

## License

MIT — free to use, modify, and distribute.

---

## ⚠️ BlockNote Whitespace Patch

This project includes a DOM patch in `BlockNoteRenderer.jsx` to fix a BlockNote bug where bold, italic, underline, or mark text would run together with adjacent words (spaces would disappear). The patch inserts spaces before/after inline marks if needed after rendering. If you update BlockNote or change the renderer, review this patch for compatibility.
