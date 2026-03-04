# Free Public LMS

A free, high-performance Learning Management System built for the public. Delivers video, text, and auto-graded quiz content with progress tracking and automated PDF certificates upon completion.

## Tech Stack

- **Backend:** Laravel 12.x (PHP 8.4)
- **Frontend:** React 19.x
- **Bridge:** Inertia.js (SPA routing)
- **Auth Scaffold:** Laravel Breeze (React + Inertia)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (all components in `resources/js/Components/ui/`)
- **Database:** MySQL (configured for cPanel deployment)

## Project Structure

```
resources/
  js/
    Components/
      ui/           # Shadcn UI components (button, card, badge, etc.)
    hooks/          # React hooks (use-toast)
    lib/            # Utilities (cn function)
    Layouts/        # Page layouts (Authenticated, Guest)
    Pages/          # Inertia page components
  css/
    app.css         # Tailwind + Shadcn CSS variables
app/
  Http/
    Controllers/    # Laravel controllers
  Models/           # Eloquent models
database/
  migrations/       # Database migrations
routes/
  web.php           # Web routes
  auth.php          # Auth routes
```

## Database Configuration

Configured for MySQL (cPanel deployment). Set the following environment variables:
- `DB_HOST` — MySQL host (typically 127.0.0.1 for cPanel)
- `DB_PORT` — 3306
- `DB_DATABASE` — your database name
- `DB_USERNAME` — your database user
- `DB_PASSWORD` — your database password (set as a Replit secret)

## Development Workflow

The `start.sh` script starts both:
1. Vite dev server on port 5173 (HMR for React/JS assets)
2. PHP artisan serve on port 5000 (main web server)

## Shadcn UI Components

All PRD-mapped components are scaffolded in `resources/js/Components/ui/`:
- `button`, `card`, `badge`, `progress` — Course catalog & dashboard
- `accordion`, `checkbox`, `separator` — Course player curriculum sidebar
- `radio-group`, `alert` — Quiz interface
- `dialog`, `tabs`, `table`, `toast` — Admin dashboards
- `navigation-menu`, `sheet`, `dropdown-menu` — Global navigation
- `select`, `toggle-group` — Course catalog filters
- `input`, `label`, `avatar` — Forms and user display

## Features Roadmap (per PRD)

1. **Foundation** (DONE) — Project scaffold, MySQL config, Tailwind, Shadcn UI
2. Authentication & SSO (Google/Facebook via Socialite)
3. Public Pages (Home, Course Catalog, Course Detail, Static pages)
4. Database Schema & Migrations
5. Learner Dashboard & Course Player
6. Quiz System
7. Certificate Generation
8. Admin Panel (RBAC, Course Builder, User Management, Analytics)
9. Media Upload (S3 integration)
10. SEO Settings
