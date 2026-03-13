---
title: Learner Course Activity Logging Plan
category: Operations
order: 61
slug: learner-course-activity-plan
summary: Implementation roadmap for learner course activity capture, learner-facing history, and admin course-level visibility.
---

# Learner Course Activity Logging Plan

## Goal

Capture learner learning activity events (lesson completion, quiz attempts, course progress milestones) and expose them in two places:

1. Admin course edit pages for operational visibility
2. Learner enrolled-course history for self-service tracking

This is separate from admin audit logs and uses a dedicated learner activity stream.

---

## Scope

### In scope

- Learner course-related event capture
- Learner-facing activity history per enrolled course
- Admin-facing learner activity view per course edit page
- Filtering, pagination, and event metadata
- Authorization and privacy boundaries

### Out of scope (initial rollout)

- Replacing existing admin audit log behavior
- Real-time websockets for live stream updates
- Deep analytics dashboards (aggregates/charts)

---

## Event Model

Use a dedicated log stream, for example:

- `log_name = learner_course`

Recommended event taxonomy:

1. `enrollment_started`
2. `lesson_completed`
3. `lesson_marked_incomplete` (only if feature exists)
4. `quiz_attempt_started` (optional)
5. `quiz_attempt_submitted`
6. `quiz_passed`
7. `quiz_failed`
8. `course_completed`

Suggested event properties:

- `course_id`, `course_title`
- `section_id`, `section_title`
- `lesson_id`, `lesson_title`
- `quiz_attempt_id`
- `score`, `pass_threshold`, `passed`
- `enrollment_id`
- `metadata` (small, non-sensitive context)

---

## Capture Points

Instrument learner flow controllers at source actions:

1. Enrollment endpoint:
- Emit `enrollment_started`

2. Lesson completion endpoint:
- Emit `lesson_completed`
- Emit `course_completed` when completion threshold is reached

3. Quiz submission endpoint:
- Emit `quiz_attempt_submitted`
- Emit `quiz_passed` or `quiz_failed` based on result

Implementation guideline:

- Reuse the existing activity logging helper pattern
- Add learner-focused helper methods to keep calls consistent and concise

---

## Learner Experience (UI)

Add an Activity History section within each enrolled course context.

Display columns:

- Event
- Lesson/Quiz
- Result (score, pass/fail when relevant)
- Timestamp

Learner filters:

- Event type
- Date range

Rules:

- Learner can only access their own activity in enrolled courses
- No visibility into other learners

---

## Admin Experience (Course Edit)

Add a Learner Activity section/tab on each admin course edit page.

Features:

- Filter by learner
- Filter by event type/date
- Paginated event list scoped to that course

Use case:

- Investigate learner progress issues per course quickly without navigating global logs

---

## Authorization and Privacy

1. Learner endpoints:
- Only current authenticated learner's own events

2. Admin endpoints:
- Admin roles only
- Course-scoped access for the selected course

3. Sensitive data:

- Do not store or expose full quiz answer payloads in activity properties
- Keep only safe summary metadata (score, pass/fail, attempt id)

4. Redaction:

- Reuse existing redaction strategy for exports and UI when needed

---

## Query and Performance

Add/confirm indexes supporting common access paths:

1. `log_name`
2. `causer_id`
3. `subject_type` + `subject_id`
4. `created_at`

Query surfaces:

1. Learner course activity feed (self-service)
2. Admin course learner activity feed (course-scoped)

Both should support:

- Pagination
- Filtering by event and date range
- Stable ordering by newest first

---

## Retention and Cleanup

Use dedicated retention controls for learner activity where practical:

- Retention value + unit
- Optional archive before prune
- Scheduled prune command support

Recommendation:

- Keep admin audit retention independent from learner activity retention

---

## Rollout Plan

### Phase 1: Event Capture

- Implement learner activity event writes in enrollment, lesson completion, and quiz submission flows
- Validate event correctness in database

Success criteria:

- Expected events appear with correct metadata for each learner action

### Phase 2: Learner History UI

- Build per-course learner history timeline/table
- Add event/date filtering

Success criteria:

- Learner sees accurate chronological history for enrolled courses only

### Phase 3: Admin Course-Level Visibility

- Add learner activity section to admin course edit page
- Add learner/event/date filters

Success criteria:

- Admin can inspect learner activity scoped to the course

### Phase 4: Export and Hardening

- Optional admin export for learner-course activity
- Redaction and retention refinement

Success criteria:

- Exports and retention operate within policy constraints

---

## Acceptance Criteria

1. Completing a lesson creates a learner activity event visible to learner and admin course view.
2. Submitting a quiz creates attempt/result events with score and pass/fail metadata.
3. Learner cannot access other learners' events.
4. Admin can filter learner activity by course, learner, event, and date.
5. Pagination and filtering remain responsive for large datasets.
