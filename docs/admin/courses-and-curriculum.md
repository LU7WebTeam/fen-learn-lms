---
title: Courses and Curriculum
category: Content Management
order: 10
slug: courses-and-curriculum
summary: How courses, sections, lessons, drag-and-drop ordering, and duplication work.
---

# Courses and Curriculum

Courses are the core content unit of the LMS. Each course contains an ordered curriculum of sections, and each section contains an ordered list of lessons. This guide covers how to create and manage that structure.

---

## Curriculum Structure

Content is organised in a three-level hierarchy:

```
Course
└── Section
    └── Lesson
```

There is no limit to the number of sections per course or lessons per section.

---

## Course Fields

When creating or editing a course, the following fields are available:

| Field | Description |
|---|---|
| **Title (EN)** | English title, shown on the catalog and course page. |
| **Title (BM)** | Bahasa Melayu title for bilingual support. |
| **Slug** | URL-safe identifier used in `/courses/{slug}`. Auto-generated but editable. |
| **Description** | Short description shown on catalog cards. |
| **Cover image** | Displayed on the catalog card and course preview page. |
| **Category** | Used for filtering in the public catalog. |
| **Difficulty** | e.g. Beginner, Intermediate, Advanced. |
| **Status** | `draft` (hidden) or `published` (visible to learners). |
| **SEO fields** | Meta title and description for search engines. |

---

## Course Introduction

Each course has a rich-text introduction displayed prominently on the public course preview page. This is separate from the short description.

- Editing is done using the **BlockNote** editor in the admin panel (supports headings, lists, images, code blocks, etc.)
- The stored content is rendered safely in the public-facing view
- Malformed content is automatically normalised before rendering to prevent page crashes

---

## Lesson Types

Each lesson has a type that determines how its content is presented to learners:

| Type | Description |
|---|---|
| **Video** | Embeds a video (URL or uploaded file). Learner marks complete when finished. |
| **Text** | Rich-text content created with BlockNote. |
| **Quiz** | A set of questions. Completion is recorded on submission. |
| **PDF** | Displays a PDF document inline in the course player. |

---

## Reordering Sections and Lessons

The curriculum editor supports drag-and-drop reordering:

- Drag **sections** to change their order within the course
- Drag **lessons** to change their order within a section

Order changes are saved immediately — no save button required. The updated order is reflected instantly for learners.

---

## Duplicating Content

Duplication shortcuts speed up content creation when building similar courses or repeating structures.

| Action | Where | Behaviour |
|---|---|---|
| Duplicate course | Course list | Creates a full copy of the course (all sections and lessons). The copy is forced to `draft` status and you are redirected to edit it immediately. |
| Duplicate section | Curriculum editor | Copies the section and all its lessons. Appears immediately in the editor. |
| Duplicate lesson | Curriculum editor | Copies the lesson into the same section. Appears immediately. |

> **Tip:** Duplicating a course is the fastest way to create a new edition of an existing course — edit the details, update the content, then publish.

---

## Publishing a Course

1. Open the course in the admin panel.
2. Ensure all required fields are filled in (title, slug, cover image, at least one published section with lessons).
3. Change **Status** from `draft` to `published`.
4. Save — the course is now visible in the public catalog and learners can enroll.
