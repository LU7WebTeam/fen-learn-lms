---
title: Platform Overview
category: Overview
order: 1
slug: platform-overview
summary: High-level guide to the public, learner, and admin sides of the LMS.
---

# Platform Overview

This LMS is built around three main experiences:

- public course discovery
- learner enrollment and learning
- admin content and platform management

## Public side

Visitors can:

- browse the course catalog at `/courses`
- open public course preview pages at `/courses/{slug}`
- read legal pages such as About, Terms, and Privacy

## Learner side

Authenticated learners can:

- access the `My Learning` dashboard
- continue enrolled courses
- complete lessons and quizzes
- view certificates when eligible
- manage profile details

## Admin side

Admins can:

- manage courses, sections, and lessons
- manage users and invitations
- configure settings and branding
- review audit activity logs
- read internal platform documentation

## Operational notes

- The production server does not run `npm`, so frontend assets must be built locally and `public/build` must be committed.
- Internal admin documentation is stored in `docs/admin/*.md` and displayed inside the admin documentation page.
- Documentation updates are manual and should be shipped together with feature changes.
