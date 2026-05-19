---
title: System Logs
category: Operations
order: 64
slug: system-logs
summary: How to view, filter, and export application system logs safely.
---

# System Logs

This guide explains how administrators can inspect platform system logs, apply filters, and export data.

---

## Access

**Location:** Admin -> System Logs (`/admin/system-logs`)

Only `super_admin` users can access this page.

---

## What Is Shown

System Logs reads from files in `storage/logs/`:

- `system.log`
- `system-YYYY-MM-DD.log` (daily files)

Entries are sorted newest-first and displayed with pagination.

Each row includes:

- Timestamp
- Level (`debug`, `info`, `warning`, `error`)
- Message
- Request ID
- User ID
- Route and request path details
- Source file
- Context payload

---

## Filters

Use filters to narrow visible entries:

- **Level**
- **Search text** (message and context)
- **Request ID**
- **User ID**
- **Date from**
- **Date to**

Filters are also applied to exports.

---

## Export

Use the export action to download filtered logs:

- **CSV** (default)
- **JSON** (`format=json`)

Exports include export timestamp, applied filters, and all matching log entries.

---

## Redaction and Safety

Before display/export, system log context can be redacted based on configurable settings:

- `system_log_redaction_enabled`
- `system_log_redacted_keys`

When redaction is enabled, sensitive keys (for example password, token, authorization, captcha secrets) are masked as `[REDACTED]`.

---

## Operational Notes

- If no matching log files are present, the page will show no entries.
- Use Request ID to correlate a user-reported issue with backend log traces.
- Keep redaction enabled in production environments.
