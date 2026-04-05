---
title: Platform Overview
category: Overview
order: 1
slug: platform-overview
summary: High-level guide to the public, learner, and admin sides of the LMS.
---

# Platform Overview

This LMS is a full-stack learning management system built with Laravel 12, Inertia.js, and React. It serves three distinct audiences — guests, learners, and administrators — each with their own interface and capabilities.

---

## The Three Experiences

| Audience | Entry point | Description |
|---|---|---|
| **Guests / Public** | `/courses` | Browse the course catalog and read course previews without logging in. |
| **Learners** | `/dashboard` | Enroll in courses, track progress, complete lessons and quizzes, earn certificates. |
| **Admins** | `/admin/dashboard` | Manage content and operations based on role permissions (`course_viewer`, `content_editor`, `super_admin`). |

---

## Public Side

The guest-facing side requires no account. Visitors can:

- Browse the full course catalog at `/courses`
- View individual course preview pages at `/courses/{slug}`, including the course introduction, curriculum outline, and enroll button
- Read static pages: About, Terms of Service, Privacy Policy

All public pages use the LMS branding (logo, platform name) set in admin Settings.

Landing page routes currently available:

- `/` → active landing page (`Landing/Home`)
- `/backup-landing` → backup welcome page (`Welcome`)

---

## Learner Side

After logging in, learners land on their **My Learning** dashboard. From there they can:

- See quick stats: enrolled, in-progress, and completed course counts
- Resume an in-progress course from the continue-learning card
- Browse all enrolled and completed courses
- Open the course player to watch videos, read text lessons, view PDFs, or take quizzes
- Download completion certificates once a course is finished
- Edit their profile (name, email, avatar, biographic details)

---

## Admin Side

The admin panel lives at `/admin` and is accessible to staff roles with different permission levels.

| Role | Access summary |
|---|---|
| `course_viewer` | Read-only access to permitted courses only. |
| `content_editor` | Full course and lesson management. |
| `super_admin` | Full platform access, including users, settings, logs, and security actions. |

Core admin capabilities:

- **Courses** — create, edit, publish, duplicate, and delete courses; manage sections and lessons
- **Users** — browse accounts, change roles, send staff invitations, suspend/unsuspend
- **Settings** — configure platform name, logo, favicon, fonts, SMTP credentials, and customisable email templates for invitations, verification, and password reset
- **Certificates** — configure per-course certificate templates and completion requirements
- **Activity Logs** — review a full audit trail of admin actions
- **Documentation** — this internal reference, loaded from `docs/admin/*.md`

Authentication note:

- Learner and admin login both use email-based 2FA verification codes when enabled.
- Set `TWO_FACTOR_ENABLED=false` in environment config to disable 2FA for local/dev scenarios.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP) |
| Frontend | React 19 via Inertia.js v2 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Build tool | Vite 7 |
| Database | MySQL (via Laragon locally) |
| Auth | Laravel Breeze (extended) |

---

## Operational Notes

> **Production has no `npm`.** All frontend assets must be built locally with `npm run build` and the resulting `public/build/` folder committed to the repository before deploying.

- Documentation lives in `docs/admin/*.md` in the repository and is displayed inside the admin documentation page — no database involved.
- Documentation should be updated in the same commit as any feature change it describes.
- Frontend assets are tracked in `public/build`. For frontend updates, run `npm run build` and commit updated build artifacts before deploy.
