---
title: Users and Access
category: Administration
order: 30
slug: users-and-access
summary: Roles, user management, profile access, invitations, and suspension controls.
---

# Users and Access

This guide covers everything admins need to know about managing user accounts — from role assignments and staff invitations to suspension and learner profile access.

---

## Roles

The platform has three roles, listed from least to most privileged:

| Role | Description |
|---|---|
| `learner` | Default role. Can enroll in courses, track progress, and take quizzes. |
| `content_editor` | Can create and manage courses, sections, and lessons. Cannot manage users. |
| `super_admin` | Full access to all admin features including user management and platform settings. |

> **Note:** Role changes take effect immediately. A user currently viewing an admin page who has their role downgraded will lose access on their next request.

---

## Managing Users

### Browsing the User List

Navigate to **Admin → Users** to see all registered accounts. The list shows:

- Full name and email address
- Current role
- Account status (active / suspended)
- Registration date

Use the search bar at the top to filter by name or email.

### Changing a User's Role

1. Find the user in the list and open their profile.
2. Select the new role from the **Role** dropdown.
3. Click **Save** — the change is applied instantly and recorded in the Activity Log.

### Editing a User's Profile

Admins can edit any user's name, email, and extended learner profile fields directly from the admin user detail page. This is useful for correcting mistakes during onboarding.

Fields available for editing include:

- Name and email address
- Gender, race, and state
- Birthdate and occupation
- Organisation (optional)

### Viewing Enrollment Details

On a learner's profile page, admins can see:

- All courses the learner is enrolled in
- Completion percentage per course
- Lesson-level progress status

---

## Suspending and Unsuspending Accounts

Suspension prevents a user from logging in without deleting their data or progress.

### To suspend an account

1. Open the user's profile in the admin panel.
2. Click **Suspend Account**.
3. Enter a reason for the suspension (this is stored in the Activity Log).
4. Confirm — the account is suspended immediately.

### To unsuspend an account

1. Open the suspended user's profile.
2. Click **Unsuspend Account**.
3. The user can log in again straight away.

> Suspended users see a clear message when they attempt to sign in, informing them that their account has been suspended.

---

## Staff Invitations

Staff accounts (`content_editor`, `super_admin`) are created through a controlled invitation flow rather than self-registration, to keep the admin user base secure.

### Sending an invitation

1. Go to **Admin → Users** and click **Invite Staff**.
2. Enter the invitee's email address and select the target role.
3. Click **Send Invitation** — the system emails a secure, time-limited token link.

The content of the invitation email (subject, title, body text, and button label) can be customised in **Admin → Settings → Email → Staff Invitation**.

### What happens next

- The recipient clicks the link in the email.
- They are shown a registration form pre-filled with their email address.
- On completion, their account is created with the assigned role.

### Token expiry

Invitation tokens expire after **48 hours**. If the link is not used in time, a new invitation must be sent. Expired tokens are automatically cleaned up.

---

## Learner Profile Access

Learners can update their own profile information from the **Profile** page, accessible via the navigation header or the avatar dropdown menu.

### Fields learners can edit

- Display name and email address
- Avatar image
- Gender and race
- Home state
- Date of birth
- Occupation and organisation

Admins can also edit these fields on behalf of a learner from the admin user detail page.

---

## Security Notes

- All role changes, suspensions, and profile updates performed by admins are recorded in the **Activity Log** with a timestamp and the acting admin's name.
- The admin panel is protected by `auth`, `verified`, and `super_admin` middleware — learners and content editors cannot access it.
- Invitation tokens are single-use and stored as hashed values; the plain token is only ever sent in the email.
