---
title: Public Catalog and Preview
category: Public Experience
order: 40
slug: public-catalog-and-preview
summary: Guest-facing catalog and course preview behavior, layout, and branding.
---

# Public Catalog and Preview

## Course catalog

The public catalog is available at `/courses`.

Current behavior:

- supports both guests and logged-in users
- guest users see a full-width layout
- catalog cards render one course per row
- cards use a horizontal layout with image left and content right
- category and difficulty filters are available

## Course preview page

The public course page is available at `/courses/{slug}`.

Current behavior:

- guest users see full-width layout
- course introductions render safely from stored rich content
- learners can continue from the course page if already enrolled

## Branding

Guest-facing pages now use LMS branding rather than the default Laravel logo in the guest layout header.
