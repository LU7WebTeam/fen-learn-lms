---
title: Settings and Certificates
category: Administration
order: 50
slug: settings-and-certificates
summary: Platform branding, settings, email checks, custom fonts, and certificate management.
---

# Settings and Certificates

This guide covers the global platform settings and the per-course certificate configuration system.

---

## Platform Settings

**Location:** Admin → Settings

These settings control the appearance and identity of the platform across all public and learner-facing pages.

| Setting | Description |
|---|---|
| **Platform name** | Shown in the browser tab, header, and emails. |
| **Tagline** | Short descriptive line shown on the public landing page. |
| **Logo** | Uploaded image used in the guest layout header and certificates. |
| **Favicon** | Small icon shown in browser tabs. |
| **Custom fonts** | Upload `.ttf` or `.otf` font files for use in certificate templates. |

### How settings are applied

Saved settings are stored in the `settings` database table and shared into the React frontend via Inertia's shared data on every page request. No build step is needed to reflect a settings change — save and reload.

### Email testing

The Settings page includes an **Send test email** tool. Use this to verify that your mail configuration (SMTP credentials in `.env`) is working correctly before relying on the invitation or notification system.

---

## Custom Fonts

Custom fonts uploaded via Settings are available for selection when designing certificate templates.

1. Go to **Admin → Settings → Fonts**
2. Upload a `.ttf` or `.otf` font file
3. The font becomes available in the certificate font selector

Fonts are stored in the `custom_fonts` table and served from `storage/app/fonts/`.

---

## Certificates

Certificates are configured at the **course level**, not globally. Each course can have its own certificate design.

**Location:** Admin → Courses → [select course] → Certificate tab

### Configuration options

| Option | Description |
|---|---|
| **Enable certificate** | Toggle whether this course issues a certificate on completion. |
| **Size and orientation** | e.g. A4 landscape, A4 portrait, Letter. |
| **Background image** | Upload a decorative background for the certificate PDF. |
| **Branding** | Platform logo placement and sizing. |
| **Text fields** | Customise the heading, body text, and completion message. |
| **Signatory** | Name, title, and signature image for the authorising person. |
| **Font** | Choose from system fonts or uploaded custom fonts. |
| **Completion requirements** | Minimum lesson completion percentage required before the certificate is issued. |

### Completion requirements

By default, a learner must complete **100%** of lessons to earn a certificate. This threshold can be lowered per course if partial completion should qualify.

---

## Public Certificate Access

Certificates are publicly accessible by a unique UUID — no login required. This allows learners to share their certificate link with employers or institutions.

- **View URL:** `/certificates/{uuid}`
- **Download URL:** `/certificates/{uuid}/download` (generates a PDF)

> Certificates are only generated after the completion requirement is met. A learner who has not completed enough lessons will not have a certificate UUID.
