---
title: Documentation Maintenance
category: Operations
order: 70
slug: documentation-maintenance
summary: How the admin documentation system works and how future docs should be maintained.
---

# Documentation Maintenance

This page explains how the admin documentation system works technically and how it should be maintained as the platform evolves.

---

## How It Works

The documentation center is backed entirely by Markdown files stored in the repository — there is no database involved.

1. Files are stored in `docs/admin/*.md`
2. On each page request, `App\Support\AdminDocumentation` reads all `.md` files from that directory
3. Frontmatter is parsed to extract metadata (title, category, order, slug, summary)
4. Files are grouped by `category` and sorted by `order`, then displayed in the sidebar
5. The selected document's Markdown content is passed to the React frontend and rendered with `react-markdown` + `remark-gfm`

---

## File Format

Every documentation file must begin with a YAML frontmatter block:

```markdown
---
title: My Feature
category: Content Management
order: 15
slug: my-feature
summary: One-sentence description shown in the sidebar under the title.
---

# My Feature

Content goes here...
```

### Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Display name shown in the sidebar and as the page heading. |
| `category` | Yes | Groups related docs together in the sidebar. Use an existing category name to keep things tidy. |
| `order` | Yes | Integer controlling sort order within a category — lower numbers appear first. |
| `slug` | Yes | URL segment used in `/admin/docs/{slug}`. Must be unique and URL-safe (use hyphens). |
| `summary` | No | Short description shown under the title in the sidebar. Recommended. |

---

## Existing Categories

Use these category names to add new docs to existing groups:

| Category | Used for |
|---|---|
| **Overview** | High-level platform introduction |
| **Content Management** | Courses, sections, lessons |
| **Learners** | Learner-facing features |
| **Administration** | User management, settings, certificates |
| **Public Experience** | Guest-facing catalog and pages |
| **Operations** | Activity logs, maintenance, infrastructure |

To create a new category, simply use a new string in the `category` frontmatter field — it will appear automatically in the sidebar.

---

## Adding a New Doc

1. Create a new `.md` file in `docs/admin/`, e.g. `docs/admin/notifications.md`
2. Add the required frontmatter at the top (see format above)
3. Write the documentation in standard Markdown
4. Supported Markdown features: headings, tables, bold/italic, blockquotes, code blocks (fenced with language), ordered and unordered lists, horizontal rules (`---`)
5. Commit the file — it appears in the sidebar immediately on next page load (no build step needed)

---

## Maintenance Rule

> **When a feature changes, update the docs in the same commit.**

This keeps the documentation accurate and ensures it is never silently out of date. Specifically:

- If you change how a feature works → update the matching `.md` file
- If you add a new feature → create a new `.md` file
- If you remove a feature → delete or update the matching `.md` file

---

## Why Markdown Files Instead of a CMS?

The documentation is intentionally stored as repository files rather than in a database or CMS because:

- **Version-controlled** — every change is tracked in git alongside the code it describes
- **No extra tooling** — no admin editor UI to build or maintain
- **Readable by developers** — docs can be read directly in any code editor or on GitHub
- **Trustworthy** — content only changes when someone deliberately edits and commits a file
