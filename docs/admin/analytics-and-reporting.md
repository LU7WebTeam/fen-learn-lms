---
title: Analytics and Reporting
category: Operations
order: 63
slug: analytics-and-reporting
summary: How to use course analytics filters, dashboard metrics, and CSV export.
---

# Analytics and Reporting

This guide explains how to use the Admin Analytics page to inspect course performance and export data for reporting.

---

## Access

**Location:** Admin -> Analytics (`/admin/analytics`)

Analytics is course-scoped. Users with the `course_viewer` role can only access analytics for courses assigned to them.

---

## Filters

The analytics page supports these filters:

- **Course** (`course_id`)
- **Date range** (`date_from`, `date_to`)
- **Gender**
- **Race**
- **State**
- **Occupation**
- **Organization**
- **Age group**

All analytics widgets and learner tables update based on the active filter set.

---

## Dashboard Data

The page provides course-level analytics including:

- Enrollment totals
- Completion totals and completion rate
- Average progress
- Average quiz score
- Enrollment and completion trends by day
- Lesson funnel and lesson-level completion rates
- Quiz performance breakdown
- Learner-level progress and achievement rows

---

## CSV Export

Use **Export CSV** to download the currently filtered analytics dataset.

Export includes:

- Export timestamp and selected course metadata
- Applied filters
- Summary metrics
- Learner-level rows (profile and achievement fields)
- Quiz mark columns per quiz lesson

The export respects the same filters currently applied on-screen.

---

## Notes

- If no course is selected or available for the current user scope, analytics data will not render.
- Date filtering applies to trend datasets and learner listings in the selected range.
- Course viewer access is restricted to permitted courses only.
