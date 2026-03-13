---
title: Settings and Certificates
category: Administration
order: 50
slug: settings-and-certificates
summary: Platform branding, configurable email templates and SMTP, custom fonts, and per-course certificate management.
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

The Settings page includes a **Send test email** tool. Use this to verify that your mail configuration (SMTP credentials in `.env`) is working correctly before relying on the invitation or notification system.

---

## Email Settings

**Location:** Admin → Settings → Email tab

The Email tab uses a left-side section navigator with five areas:

| Section | Purpose |
|---|---|
| **SMTP & Sender** | Configure the mail server connection and default sender identity |
| **Staff Invitation** | Customise the invitation email sent to new staff members |
| **Email Verification** | Customise the email address verification email |
| **Password Reset** | Customise the password reset email |
| **Test Email** | Send a connectivity test to any address |

### SMTP & Sender

These fields control how outgoing emails connect to your mail provider:

| Field | Description |
|---|---|
| **SMTP Host** | Mail server hostname, e.g. `smtp.mailgun.org` |
| **SMTP Port** | Typically `587` (TLS) or `465` (SSL) |
| **SMTP Username** | Account credential |
| **SMTP Password** | Account credential |
| **Encryption** | `tls` or `ssl` |
| **From Address** | Sender email address shown to recipients |
| **From Name** | Sender name shown to recipients |

> SMTP credentials are saved in the `settings` table. They can also be configured in `.env` if you prefer environment-level control — `.env` values take precedence.

### Email branding

All outgoing emails use the platform branding configured in **Admin → Settings → Branding**:

- **Logo** — shown in the email header
- **Background colour** — body background of the email
- **Button colour** — call-to-action button colour

No template changes are needed to update the visual identity — changing branding settings applies to all future emails automatically.

### Email templates

Each of the three system emails — Staff Invitation, Email Verification, and Password Reset — has a customisable template. Fields for each template:

| Field | Description |
|---|---|
| **Subject** | Email subject line |
| **Title** | Large heading inside the email body |
| **Body** | Main message paragraph |
| **Button text** | Label on the call-to-action button |

Inline **placeholder chips** are shown under each field to indicate which tokens may be used in that field. Saving a template that uses an unsupported `{{token}}` will be blocked with a validation error.

### Available placeholder tokens

| Token | Available in | Description |
|---|---|---|
| `{{platform_name}}` | All templates | The platform name from Settings |
| `{{inviter_name}}` | Staff Invitation only | Name of the admin who sent the invitation |
| `{{role_label}}` | Staff Invitation only | Human-readable role name, e.g. "Content Editor" |

### Sending a template test

Each template section (Invitation, Verification, Reset) includes:

1. A **Test Recipient Email** field — enter any address to receive the test
2. A **Send test email** button — sends the current saved template to that address

Test emails use realistic dummy data for dynamic values (action URLs, names, etc.) and append `[Test]` to the subject so they are easy to identify in the recipient's inbox.

### SMTP connectivity test

The **Test Email** section at the bottom of the Email tab sends a plain connectivity check to a specified address. Use this to confirm your SMTP credentials are correct before worrying about template content.

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
