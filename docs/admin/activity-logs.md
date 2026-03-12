---
title: Activity Logs
category: Operations
order: 60
slug: activity-logs
summary: Admin audit logging coverage, implementation notes, and current visibility.
---

# Activity Logs

## Access

Admins can review audit entries at `/admin/activity-logs`.

## Current implementation

The system uses `spatie/laravel-activitylog` and stores audit data in the `activity_log` table.

Admin actions are recorded through `App\\Support\\ActivityLogger`.

## Currently logged actions

- course create, update, duplicate, and delete
- course introduction updates
- course certificate updates
- section create, update, reorder, duplicate, and delete
- lesson create, update, reorder, duplicate, and delete
- user role changes
- user suspension and reinstatement
- admin-side user profile updates

## Purpose

Use the audit log for:

- change visibility
- internal accountability
- debugging recent admin-side modifications
