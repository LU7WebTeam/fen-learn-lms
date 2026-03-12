---
title: Learner Experience
category: Learners
order: 20
slug: learner-experience
summary: Overview of the learner dashboard, course player, progress, and profile editing.
---

# Learner Experience

This guide describes the learner-facing side of the platform — from the dashboard and course player to progress tracking and profile management.

---

## My Learning Dashboard

When a learner logs in, they land on the **My Learning** dashboard (`/dashboard`). It is designed to give an immediate overview of their learning activity.

### What the dashboard shows

| Section | Description |
|---|---|
| **Welcome hero** | Personalised greeting with the learner's name. |
| **Quick stats** | Count of enrolled, in-progress, and completed courses. |
| **Continue learning** | A shortcut card for the most recently active course. |
| **In-progress courses** | All courses the learner has started but not yet completed. |
| **Completed courses** | All courses where 100% of lessons are marked complete. |

---

## Course Player

Learners access course content through the course player at `/learn/{course}/{lesson}`.

### What learners can do in the player

- Navigate between lessons using the sidebar curriculum outline
- Watch video lessons and mark them as complete
- Read text lessons (rendered from BlockNote rich content)
- View PDF lessons inline
- Submit quiz attempts and see results
- Return to a completed course to review lessons at any time

### Completing a lesson

Lesson completion is recorded when:

- For **video**, **text**, and **PDF** lessons — the learner clicks the **Mark as Complete** button
- For **quiz** lessons — the learner submits their answers

Once all lessons in a course are complete, the enrollment is marked as finished and a certificate becomes available (if certificate is enabled for that course).

---

## Progress Tracking

Progress is calculated as the percentage of lessons completed within an enrollment.

```
Progress % = (completed lessons ÷ total lessons) × 100
```

This progress figure is used across:

- **Learner dashboard** — progress bars on course cards
- **Admin user view** — per-enrollment progress for each learner
- **Course completion logic** — triggers certificate readiness
- **Continue-learning shortcut** — identifies the most active in-progress course

---

## Learner Profile

Learners can update their profile at any time via the **Profile** link in the navigation header, or through the avatar dropdown menu.

### Editable fields

| Field | Notes |
|---|---|
| **Name** | Display name shown throughout the platform. |
| **Email** | Used for login and system emails. Requires re-verification if changed. |
| **Avatar** | Profile photo, shown in the header and on certificates. |
| **Gender** | Male / Female |
| **Race / Ethnicity** | Malay, Chinese, Indian, Other Bumiputera, Other |
| **State** | Home state within Malaysia. |
| **Date of birth** | Must be a past date. |
| **Occupation** | Current job or role. |
| **Organisation / Institution** | Optional — employer or school name. |

> Admins can also edit a learner's profile fields directly from the admin user detail page.
