---
title: Courses and Curriculum
category: Content Management
order: 10
slug: courses-and-curriculum
summary: How courses, sections, lessons, drag-and-drop ordering, and duplication work.
---

# Courses and Curriculum

## Course fields

Courses currently support:

- English and Bahasa Melayu titles
- slug
- descriptions
- cover image
- category
- difficulty
- publishing status
- SEO fields

## Course introduction

Each course has a rich introduction used on the public course preview page.

- editing uses BlockNote in admin
- rendering supports stored BlockNote content safely
- malformed content is normalized before rendering to avoid crashes

## Curriculum structure

Hierarchy:

1. Course
2. Section
3. Lesson

Lesson types supported:

- video
- text
- quiz
- pdf

## Reordering

Admins can drag and drop:

- sections within a course
- lessons within a section

These changes persist immediately through reorder endpoints.

## Duplication

Current duplicate actions:

- duplicate course
- duplicate section
- duplicate lesson

Behavior notes:

- duplicated courses redirect directly into editing the new copy
- duplicated sections and lessons appear immediately without needing a refresh
- copied courses are forced back to `draft`
