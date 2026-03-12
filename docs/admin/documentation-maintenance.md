---
title: Documentation Maintenance
category: Operations
order: 70
slug: documentation-maintenance
summary: How the admin documentation system works and how future docs should be maintained.
---

# Documentation Maintenance

## Source folder

Internal admin documentation lives in:

`docs/admin/`

## File format

Each markdown file can include frontmatter such as:

- `title`
- `category`
- `order`
- `slug`
- `summary`

## Maintenance rule

When a feature changes:

1. update the implementation
2. update the matching markdown file
3. add a new markdown file if the feature is new

## Why this is manual

The documentation center is intentionally backed by repo markdown files instead of automatic code-derived documentation.

That keeps the content readable, intentional, and easier for admins to trust.
