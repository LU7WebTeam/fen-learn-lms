# UAT Activities Outline

## Purpose
This document outlines User Acceptance Testing (UAT) activities for the LMS from two points of view:
- Public and Learner users
- Admin users

It is intended to guide internal test runs and later be adapted into a client-facing UAT script.

## UAT Objectives
- Validate that key business flows work end-to-end.
- Confirm role-based access and permissions are correct.
- Ensure usability, clarity, and expected behavior across major screens.
- Verify core reporting and export outputs used by stakeholders.
- Capture issues clearly for triage and re-test.

## Scope
### In scope
- Public pages and learner journeys (registration, login, enrollment, learning, quiz, certificate).
- Admin journeys (courses, lessons/quizzes, users, analytics, exports, settings).
- Critical integrations/features in normal operation.

### Out of scope (unless explicitly requested)
- Load/performance benchmarking.
- Penetration testing.
- Browser support outside agreed target list.

## Test Setup
- Environment: staging/UAT environment mirroring production config.
- Test accounts:
  - Public user (not logged in)
  - Learner account
  - Content Editor account
  - Course Viewer account
  - Super Admin account
- Test data:
  - At least 1 published course with mixed lesson types (text/video/quiz/pdf).
  - At least 1 course completion path that generates certificate.
  - At least 1 quiz with passing score and 1 informational quiz.

## UAT Execution Workflow
1. Prepare test data and accounts.
2. Run test cases by module.
3. Log defects with steps, expected result, actual result, screenshots/video.
4. Triage defects by severity and business impact.
5. Re-test fixed defects.
6. Final sign-off based on acceptance criteria.

## Acceptance Severity Guide
- Critical: Core flow broken, no workaround.
- High: Major function impacted, workaround exists but painful.
- Medium: Function works partially or with minor confusion.
- Low: Cosmetic/wording/minor UX issue.

---

## A. Public and Learner UAT Activities

### A1. Public Access and Discovery
- Verify landing/home page loads and key links work.
- Verify course catalog visibility for public users.
- Verify course details page renders correctly for non-logged-in users.
- Verify language switcher and localization display expected content.
- Verify legal pages (terms/privacy/about) are reachable.

### A2. Registration, Login, and Access
- Verify new learner registration flow completes successfully.
- Verify login, logout, and forgot-password flows.
- Verify email verification behavior (if enabled).
- Verify captcha behavior (if enabled on auth forms).
- Verify blocked/suspended accounts cannot log in.

### A3. Enrollment and Course Start
- Verify learner can enroll in a published course.
- Verify learner sees enrolled course in dashboard/my learning.
- Verify learner can enter lesson player and navigate lessons.
- Verify prerequisite/locked lesson logic behaves correctly.

### A4. Learning Experience
- Verify text lesson content displays correctly.
- Verify video lesson playback and completion behavior.
- Verify PDF lesson display/open behavior.
- Verify lesson completion updates progress accurately.
- Verify progress percentages and completion states match expected outcomes.

### A5. Quiz Experience
- Verify quiz submission and scoring for standard quizzes.
- Verify multiple attempts behavior where max attempts is configured.
- Verify informational quiz behavior where passing score is not required.
- Verify quiz history and marks display expected values.
- Verify edge cases (empty/invalid answer attempts blocked appropriately).

### A6. Completion and Certificate
- Verify course completion status is set correctly.
- Verify certificate generation occurs when configured.
- Verify certificate page displays valid learner/course/date data.
- Verify certificate download works.
- Verify no certificate shown when course/certificate conditions are not met.

### A7. Learner Profile and Localization
- Verify learner can view/update allowed profile fields.
- Verify profile options (occupation/organization, etc.) behave correctly.
- Verify date/time display appears in expected timezone format.

### A8. Learner Notifications and Messaging
- Verify success/error/flash messages are understandable.
- Verify key learner emails (if in scope) are delivered and correctly branded.

---

## B. Admin UAT Activities

### B1. Admin Access and Role Permissions
- Verify role-based access boundaries:
  - Super Admin: full access
  - Content Editor: content-focused access
  - Course Viewer: read-only areas as designed
- Verify unauthorized access returns correct behavior (403/hidden UI).

### B2. Dashboard and Overview
- Verify admin dashboard metrics load.
- Verify no major UI regressions across key widgets/cards.
- Verify links from dashboard navigate to correct modules.

### B3. Course Management
- Verify create/edit/publish/unpublish course flow.
- Verify section and lesson create/edit/reorder/duplicate/delete flows.
- Verify media/content fields save and render correctly.
- Verify course duplication behavior and resulting data quality.

### B4. Quiz Authoring (Admin)
- Verify quiz lesson editor loads/saves correctly.
- Verify passing score handling including zero/informational mode.
- Verify question/option add, remove, reorder, and correctness toggles.
- Verify quiz content appears correctly in learner player after publish.

### B5. User Management
- Verify user listing, searching, and profile view/edit.
- Verify role change controls and restrictions.
- Verify suspend/unsuspend flows.
- Verify password reset flows from admin.
- Verify super-admin-only delete user flow with safeguards:
  - Cannot delete own account
  - Cannot delete last remaining super admin

### B6. Analytics and Reporting
- Verify analytics filters by date/course/profile attributes.
- Verify charts and summary numbers are sensible for test data.
- Verify learner table data accuracy.
- Verify CSV export downloads and contains correct values.
- Verify learners export includes quiz marks columns and values as expected.

### B7. Settings and Configuration
- Verify branding updates (logos, platform name, etc.) reflect correctly.
- Verify localization/settings changes apply correctly.
- Verify email/SMTP test and template previews.
- Verify captcha/security settings and behavior toggles.
- Verify maintenance mode behavior (if enabled).

### B8. Logs and Auditing
- Verify activity/system logs capture key admin actions.
- Verify export from logs modules works.
- Verify redaction/sensitive fields behavior where applicable.

---

## C. Cross-Cutting UAT Checks

### C1. Data Integrity
- Verify no duplicate/invalid records created by normal usage.
- Verify cascading/cleanup behavior for deletes where applicable.

### C2. Usability and Content Quality
- Verify labels, messages, and button text are clear.
- Verify no broken links or unclear navigation paths.

### C3. Browser and Device Sanity
- Verify agreed browser set (desktop at minimum).
- Verify mobile/responsive behavior for critical learner flows.

### C4. Timezone and Date Handling
- Verify all key date/time displays align with expected timezone.
- Verify exported date/time values are consistent.

---

## Defect Log Template
Use this format for each issue:
- ID:
- Module:
- Role:
- Steps to reproduce:
- Expected result:
- Actual result:
- Severity: Critical/High/Medium/Low
- Evidence: screenshot/video/log
- Status: Open/In Progress/Ready for Retest/Closed

## UAT Sign-Off Checklist
- All Critical defects closed.
- All High defects closed or explicitly accepted.
- Medium/Low defects reviewed and dispositioned.
- Client walkthrough completed.
- Final approval recorded with date and approver names.

## Notes for Client Session Preparation
- Convert this outline into executable test scripts with test IDs.
- Pre-fill expected outcomes based on agreed business rules.
- Assign owner per module (Facilitator, Tester, Observer, Recorder).
- Timebox session by module to keep progress visible.
