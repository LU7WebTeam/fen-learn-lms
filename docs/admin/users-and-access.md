---
title: Users and Access
category: Administration
order: 30
slug: users-and-access
summary: Roles, user management, course viewer access scope, password reset controls, invitations, and suspension.
---

# Users and Access

This guide covers everything admins need to know about managing user accounts — from role assignments and staff invitations to suspension and learner profile access.

---

## Roles

The platform has four roles, listed from least to most privileged:

| Role | Description |
|---|---|
| `learner` | Default role. Can enroll in courses, track progress, and take quizzes. |
| `course_viewer` | Admin-panel read-only role with access only to assigned courses. |
| `content_editor` | Can create and manage courses, sections, and lessons. Cannot manage users. |
| `super_admin` | Full access to all admin features including user management and platform settings. |

> **Note:** Role changes take effect immediately. A user currently viewing an admin page who has their role downgraded will lose access on their next request.

### Course Viewer scope

`course_viewer` is a restricted staff role designed for audits, QA, and stakeholders who need visibility but not editing rights.

- Can access the admin shell and assigned course pages.
- Cannot create, duplicate, or delete courses.
- Cannot modify course Introduction, Details, Curriculum, or Certificate settings.
- Cannot access Users, Settings, Activity Logs, or Documentation sections.

Course access is assigned per user from **Admin → Users** and stored as per-course permissions.

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

> When changing a user away from `course_viewer`, their per-course viewer access assignments are removed automatically.

### Managing Course Viewer course access

1. In **Admin → Users**, open a user with role `course_viewer`.
2. Select the allowed courses in the course access selector.
3. Save to sync the assignments.

Only users with role `course_viewer` can have managed per-course access.

### Editing a User's Profile

Admins can edit any user's name, email, and extended learner profile fields directly from the admin user detail page. This is useful for correcting mistakes during onboarding.

Fields available for editing include:

- Name and email address
- Gender, race, and state
- Birthdate and occupation
- Student ID and field of study (for learners with student occupation)
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

Staff accounts (`course_viewer`, `content_editor`, `super_admin`) are created through a controlled invitation flow rather than self-registration, to keep the admin user base secure.

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

Invitation tokens expire after **7 days**. If the link is not used in time, a new invitation must be sent. Expired tokens are automatically cleaned up.

---

## Admin Password Reset Controls

Super admins have two ways to reset staff or learner passwords from **Admin → Users**:

- **Set a new password directly** (manual reset)
- **Send password reset link** (email-based reset)

### Permission rules

- Only `super_admin` can use these actions.
- The action is logged in Activity Logs with the acting admin and target user.

### Manual reset

Use this when support must set a password immediately.

- Requires password confirmation in the form.
- Minimum password length is 8 characters.
- Existing remember sessions are invalidated by rotating the remember token.

### Send reset link

Use this when the user should choose their own new password.

- Sends the standard password reset email flow to the user's email.
- Returns a success/error flash message in admin UI.

---

## Authentication Security (2FA)

The platform uses email-based 2FA during login for both learners and staff/admin accounts when enabled.

### How the login flow works

1. User enters email + password on login.
2. Credentials are validated first (without creating a session).
3. System sends a 6-digit verification code by email.
4. User enters the code on the verification screen.
5. If valid and unexpired, session is created and user is redirected.

### 2FA behavior details

- Verification code format: 6 digits.
- Code validity window: 10 minutes.
- Resend is available from the verification page.
- Successful verification clears the stored code immediately.
- Failed/expired verification shows an explicit error and does not log the user in.

### Environment toggle

Set `TWO_FACTOR_ENABLED=false` to disable 2FA (typically local development without SMTP).

When disabled, login proceeds directly after credentials are validated.

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
- Student ID and field of study (when occupation is Student)

For Student occupation, organisation/institution and field of study can be controlled by admin-managed dropdown lists in **Admin → Settings → Profiles**, with an **Other** fallback for manual entry.

Admins can also edit these fields on behalf of a learner from the admin user detail page.

---

## Security Notes

- All role changes, suspensions, and profile updates performed by admins are recorded in the **Activity Log** with a timestamp and the acting admin's name.
- The admin panel is protected by `auth`, `verified`, and `super_admin` middleware — learners and content editors cannot access it.
- Invitation tokens are single-use and stored as hashed values; the plain token is only ever sent in the email.
