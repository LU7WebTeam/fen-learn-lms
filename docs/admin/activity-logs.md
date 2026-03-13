---
title: Activity Logs
category: Operations
order: 60
slug: activity-logs
summary: Admin audit logging coverage, implementation notes, and current visibility.
---

# Activity Logs

The activity log provides a full audit trail of admin actions on the platform. Every significant change made by an administrator is recorded with the actor's identity, timestamp, and relevant details.

---

## Accessing the Log

**Location:** Admin → Activity Logs (`/admin/activity-logs`)

The page shows the 50 most recent entries, paginated, in a scrollable table. Each row in the table shows:

- **Description** — what happened (e.g. "Created course Introduction to Python")
- **Event** — the action type (created, updated, deleted, etc.)
- **Subject** — the model that was affected (e.g. Course #12)
- **Actor** — the admin who performed the action
- **Time** — date and time of the action
- **Details** — additional context such as changed fields, old/new role, or suspension reason

### Filters

Use filters at the top of the page to narrow results by:

- **Actor** (`causer_id`)
- **Subject type** (`subject_type`)
- **Event** (`event`)
- **Date from** / **Date to** (`date_from`, `date_to`)

Filters persist in pagination links, so moving to the next page keeps the same query.

### Saved filter presets

Admins can save commonly used filter combinations from the activity log page:

- **Save current** stores the active filter set in browser local storage
- **Apply preset** re-applies a saved set of filters
- **Delete preset** removes a saved preset

Preset storage is browser-local and uses the key `admin.activity-log.filter-presets.v1`.

### Exports

With or without filters, admins can export logs in two formats:

| Export | Route | Notes |
|---|---|---|
| CSV | `/admin/activity-logs/export` | Best for spreadsheets and audit sharing |
| JSON | `/admin/activity-logs/export-json` | Best for integrations and scripting |

Both export endpoints use the same filter logic as the on-screen listing.

---

## What Is Logged

### Courses

| Action | What is recorded |
|---|---|
| Created | Course title and ID |
| Updated | List of changed fields |
| Introduction updated | Course ID |
| Certificate updated | Course ID |
| Duplicated | Original and new course IDs |
| Deleted | Course title and ID |

### Sections

| Action | What is recorded |
|---|---|
| Created | Section title and course ID |
| Updated | Old and new title if changed |
| Reordered | Course ID |
| Duplicated | Original and new section IDs |
| Deleted | Section title |

### Lessons

| Action | What is recorded |
|---|---|
| Created | Lesson title and section ID |
| Updated | List of changed fields |
| Reordered | Section ID |
| Duplicated | Original and new lesson IDs |
| Deleted | Lesson title |

### Users

| Action | What is recorded |
|---|---|
| Role changed | Old role → new role |
| Suspended | Suspension reason |
| Unsuspended | Actor and target user |
| Profile updated (admin) | List of changed fields |

---

## Technical Implementation

- **Package:** `spatie/laravel-activitylog` ^4.12
- **Storage:** `activity_log` database table
- **Helper:** `App\Support\ActivityLogger` — static class wrapping spatie's fluent API
- **Log name:** all admin entries use `log_name = 'admin'`, keeping them separate from any future learner-activity logs
- **Controller:** `App\Http\Controllers\Admin\ActivityLogsController`
	- `index()` renders paginated logs + filter options
	- `export()` streams filtered CSV output
	- `exportJson()` returns filtered JSON output

To add logging to a new controller action:

```php
use App\Support\ActivityLogger;

// Basic entry
ActivityLogger::record('Deleted lesson ' . $lesson->title, $lesson, [], 'deleted');

// With changed fields
$before = $lesson->only(['title', 'type']);
$lesson->update($validated);
ActivityLogger::record('Updated lesson', $lesson, [
	'changed' => ActivityLogger::changedFields($before, $lesson->only(array_keys($before)))
], 'updated');
```

---

## When to Use the Audit Log

- **Investigating unexpected changes** — find out who changed a course title or deleted a section and when
- **Accountability** — maintain a record of all admin actions for internal review
- **Debugging** — trace the sequence of changes that led to a current state
- **Reporting** — export filtered records for operations or compliance reviews

> The activity log is read-only in the admin UI. Entries cannot be edited or deleted through the interface.
