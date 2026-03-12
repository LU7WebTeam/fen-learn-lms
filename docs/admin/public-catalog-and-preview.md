---
title: Public Catalog and Preview
category: Public Experience
order: 40
slug: public-catalog-and-preview
summary: Guest-facing catalog and course preview behavior, layout, and branding.
---

# Public Catalog and Preview

The public side of the platform is accessible to anyone without an account. It acts as the marketing and discovery surface for the LMS — showcasing available courses and encouraging enrolment.

---

## Course Catalog

**URL:** `/courses`

The catalog lists all **published** courses. Unpublished (draft) courses are not shown.

### Layout and cards

- Each card uses a **horizontal layout** — course cover image on the left, details on the right
- Cards show: course title, short description, category badge, and difficulty badge
- One course per row for clear readability

### Filtering

Visitors can filter the catalog by:

- **Category** — e.g. Technology, Business, Health
- **Difficulty** — Beginner, Intermediate, Advanced

Filters update the visible course list without a full page reload.

### Logged-in learners

When a logged-in learner visits the catalog:

- Courses they are already enrolled in show an **enrolled** indicator
- The enrol button is replaced with a **Continue** or **View** link

---

## Course Preview Page

**URL:** `/courses/{slug}`

Each course has a dedicated public preview page with full details to help visitors decide whether to enrol.

### What the page shows

| Section | Description |
|---|---|
| **Cover image** | Full-width hero image for the course. |
| **Title and description** | The course name and short description. |
| **Category and difficulty** | Displayed as badges. |
| **Course introduction** | Rich-text content authored in BlockNote, rendered safely. |
| **Curriculum outline** | List of sections and lessons (lesson titles are visible but content is gated). |
| **Enrol button** | Guests are prompted to log in; learners can enrol directly. |

### For enrolled learners

If a learner is already enrolled, the enrol button is replaced with a **Continue learning** link that takes them directly into the course player.

---

## Branding

All guest-facing pages use the platform branding configured in **Admin → Settings**:

- The **guest layout header** shows the platform logo and name instead of the default Laravel logo
- The platform name appears in the browser tab title
- Favicon is served from the uploaded favicon in settings

> To update the logo, favicon, or platform name shown on public pages, go to **Admin → Settings**.
