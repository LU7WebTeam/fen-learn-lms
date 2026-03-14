---
title: Settings Feature Expansion Plan
category: Operations
order: 62
slug: settings-security-analytics-logging-plan
summary: Roadmap for adding captcha protection, analytics integration, and system logging controls.
---

# Settings Feature Expansion Plan

## Goal

Add three new settings capabilities in the admin panel:

1. Captcha protection (Cloudflare Turnstile or Google reCAPTCHA)
2. Google Analytics (GA4) integration
3. System logging controls and visibility

This plan is designed to fit the current settings architecture in the admin panel.

---

## Current Integration Points

1. Settings routes:
- GET /admin/settings
- POST /admin/settings

2. Settings controller:
- Central defaults array for setting keys
- Group-based save dispatch via _group in update()

3. Settings UI:
- Tab-based layout in Admin Settings page

4. Settings model:
- Key-value storage
- Existing encryption for mail password

---

## Scope

### In scope

- Admin settings for captcha provider and per-form enforcement
- GA4 configuration and conditional frontend injection
- System log configuration, filtering, and export
- Secure handling of sensitive keys in settings storage

### Out of scope (initial rollout)

- Replacing admin audit log behavior
- Full observability stack (APM, traces, dashboards)
- Advanced analytics attribution/event taxonomy

---

## Phase 1: Settings Model and Secure Storage

### 1. Add new setting keys

Security:
- captcha_provider (none|turnstile|recaptcha)
- captcha_enabled_login
- captcha_enabled_register
- captcha_enabled_forgot_password
- captcha_site_key
- captcha_secret_key
- captcha_min_score (for reCAPTCHA v3)

Analytics:
- analytics_enabled
- ga4_measurement_id
- ga4_anonymize_ip
- ga4_debug_mode

Logging:
- system_logging_enabled
- system_log_level
- system_log_retention_days
- system_log_capture_context

### 2. Encrypt sensitive settings

Extend encrypted-key handling in Setting model:
- Keep mail_password encrypted
- Add captcha_secret_key to encrypted keys
- Use a small key allowlist helper for maintainability

Success criteria:
- New keys are persisted and returned reliably
- Secret keys are encrypted at rest

---

## Phase 2: Admin Settings UI

Add three tabs to Admin Settings:

1. Security
- Provider selector (None, Turnstile, reCAPTCHA)
- Site key and secret key fields
- Enable toggles for login, register, forgot password
- Min score field for reCAPTCHA v3
- Status hint (Configured / Missing key)

2. Analytics
- Enable GA4 toggle
- Measurement ID input
- Anonymize IP toggle
- Debug mode toggle

3. Logging
- Enable system logging toggle
- Log level selector (debug/info/warning/error)
- Retention days input
- Capture context toggle (request id, user id, path, IP)

Use existing group submit flow:
- _group=security
- _group=analytics
- _group=logging

Success criteria:
- Admin can save each group independently
- Validation errors are shown inline

---

## Phase 3: Runtime Integration

### 1. Captcha enforcement

Implement captcha verification service with provider drivers:
- Turnstile verifier
- reCAPTCHA verifier

Apply to selected public endpoints based on settings:
- Login
- Register
- Forgot password

Behavior:
- If captcha is enabled and token is invalid, block request
- Return clear validation message to user

### 2. Google Analytics

When analytics_enabled and ga4_measurement_id are set:
- Inject GA4 script in frontend layouts
- Track page views for both first load and Inertia navigation
- Respect anonymize_ip and debug flags

### 3. System logging

Add structured logging helpers for key platform events:
- Auth outcomes (sanitized)
- Settings changes
- Integration errors (captcha/mail)
- Background task failures

Success criteria:
- Captcha blocks invalid requests on enabled forms
- GA page views appear in GA real-time
- System logs are written with expected context fields

---

## Phase 4: System Logs Admin Surface

Add a dedicated admin page for system logs (separate from audit logs):

Features:
- Filter by level
- Date range filter
- Search by message/request id/user id
- Export/download

Reason:
- Keep technical logs separate from business/admin audit entries

Success criteria:
- Admin can inspect and export system logs without using server shell access

---

## Phase 5: Rollout and Hardening

1. Staged rollout
- Ship settings + storage first
- Enable on staging for one form (login)
- Expand to register and forgot password after validation

2. Reliability and safety
- Add provider health hints in UI
- Redact sensitive payload fields in logs
- Add request correlation id to logs

3. Operational checks
- Captcha configured status
- GA configured status
- Logging write path status

Success criteria:
- No auth regressions
- No secret leakage in settings payloads/logs
- Logs and analytics are operational in production

---

## Acceptance Criteria

1. Admin can configure Turnstile or reCAPTCHA and enable it per form.
2. Enabled forms enforce captcha and reject invalid tokens.
3. Admin can enable GA4 and see page views in real-time reports.
4. System logs are captured, filterable, and exportable in admin UI.
5. Sensitive settings (captcha secret, mail password) are encrypted at rest.
6. No sensitive values are exposed in frontend responses.

---

## Suggested Implementation Order

1. Phase 1 (keys + encryption)
2. Phase 2 (settings tabs and validation)
3. Phase 3 captcha runtime
4. Phase 3 analytics runtime
5. Phase 3 logging runtime
6. Phase 4 log viewer/export
7. Phase 5 hardening and rollout
