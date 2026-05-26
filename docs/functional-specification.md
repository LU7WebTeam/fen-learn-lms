# Functional Specification Document

Version: 1.0 (Project Delivery Baseline)  
Date: 2026-05-21  
Project: FEN Learn LMS (Expansion and Hosting of FEN PROAKTIF on FEN Website)

## 1. Purpose

This Functional Specification defines the delivered system behavior for FEN Learn LMS and maps each function to the end-user requirements in Appendix B1.

It is intended to:

- confirm what is implemented and ready for delivery,
- identify partial coverage or external dependencies,
- provide a traceable baseline for UAT and sign-off.

## 2. Scope

In scope:

- learner and admin functional behavior,
- requirement traceability against the supplied user specification,
- system-level notes that affect acceptance.

Out of scope:

- infrastructure load test evidence,
- legal/policy approval workflows,
- managed hosting SOPs owned by infrastructure provider.

## 3. Actors and Roles

- Public Visitor: browses catalog and public pages.
- Learner: registers, verifies email, completes profile, enrolls and learns.
- Course Viewer: read-only admin for permitted courses.
- Content Editor: manages course content.
- Super Admin: full administrative control.

## 4. Functional Modules

- Authentication and Access Control.
- Learner Profile and Enrollment.
- Module/Course and Lesson Management.
- Assessment and Certification.
- Progress Tracking and Reporting.
- Admin Dashboard and Logs.
- Security and Compliance Controls.

## 5. Requirement Traceability Matrix (Mapped to End User Specification)

Legend:

- Implemented: requirement delivered in current baseline.
- Partial: requirement partly delivered or delivered with constraints.
- Gap: requirement not delivered in current baseline.
- External: fulfilled by infrastructure/operations, not application code alone.

| Req ID | User Requirement | Delivered Behavior in FEN Learn LMS | Status | Evidence (Code / Route) |
|---|---|---|---|---|
| FR-1.a.i | Collect only student Full Name, Email, Student ID, University Name, Major/Field | System collects these fields and additional demographic/profile fields (gender, race, state, birthdate, occupation, organization). | Partial | app/Models/User.php, app/Http/Controllers/ProfileSetupController.php |
| FR-1.a.ii | Do not request/store IC, home address, phone number | No IC/home address/phone fields in delivered user model and profile flow. | Implemented | app/Models/User.php, database/migrations/0001_01_01_000000_create_users_table.php |
| FR-1.b.i | User registration and login with email verification | Registration, login, and email verification flow are implemented. | Implemented | routes/auth.php, app/Http/Controllers/Auth/RegisteredUserController.php |
| FR-1.b.ii | MFA for all users | Email-based 2FA implemented for learner and admin login; configurable toggle for environment. | Implemented | app/Http/Controllers/Auth/AuthenticatedSessionController.php, app/Http/Controllers/Auth/AdminSessionController.php, config/auth.php |
| FR-1.b.iii | Role-based access control for admins and students | Roles and role checks implemented (learner, course_viewer, content_editor, super_admin), including scoped admin access. | Implemented | app/Models/User.php, app/Http/Middleware/EnsureCourseViewerScope.php |
| FR-1.b.iv | User profile management (name, email, modules enrolled, progress) | Learner and admin profile management implemented; enrollment and progress visible in dashboard/admin views. | Implemented | app/Http/Controllers/ProfileController.php, app/Http/Controllers/Admin/UsersController.php |
| FR-1.b.v | Password reset functionality | Forgot/reset password flow and admin-triggered reset options implemented. | Implemented | routes/auth.php, app/Http/Controllers/Admin/UsersController.php |
| FR-1.b.vi | Bulk user import for student registration | No delivered backend route/controller for bulk import in current baseline. | Gap | routes/web.php (no bulk import endpoint) |
| FR-1.b.vii | Ability to deactivate a student account | Suspension/unsuspension flow implemented with reason logging. | Implemented | app/Http/Controllers/Admin/UsersController.php |
| FR-1.c.i | Create/edit/delete modules and lessons | Full CRUD for courses/sections/lessons with ordering and duplication. | Implemented | app/Http/Controllers/Admin/CoursesController.php, app/Http/Controllers/Admin/LessonsController.php |
| FR-1.c.ii | Support text, PDFs, videos | Lesson types support text, pdf, video, quiz with upload/URL handling. | Implemented | app/Http/Controllers/Admin/LessonsController.php |
| FR-1.c.iii | Module prerequisites lock/unlock | Lesson prerequisite locking enforced in learning flow. | Implemented | app/Http/Controllers/LearnController.php |
| FR-1.c.iv | Self-paced learning structure | Learners progress asynchronously and resume at last lesson. | Implemented | app/Http/Controllers/LearnController.php |
| FR-1.c.v | Module enrollment automatic/manual assignment | Self-enrollment is implemented; manual assignment workflow is not explicitly delivered. | Partial | routes/web.php (courses.enroll), app/Http/Controllers/EnrollmentController.php |
| FR-1.d.i | Pre-assessment tests before commencement | No explicit pre-assessment workflow separated from normal lesson quiz flow. | Gap | app/Http/Controllers/LearnController.php |
| FR-1.d.ii | Post-assessment quizzes with MCQ and short answers | Auto-graded option-based quizzes are implemented; free-text short-answer grading flow not delivered. | Partial | app/Http/Controllers/LearnController.php, app/Http/Controllers/Admin/LessonsController.php |
| FR-1.d.iii | Automated grading system | Quiz submission auto-calculates score, percentage, pass/fail. | Implemented | app/Http/Controllers/LearnController.php |
| FR-1.d.iv | Minimum passing score 40% for certification eligibility | Passing scores are configurable per quiz/template; not fixed globally at 40%. | Partial | app/Http/Controllers/LearnController.php, app/Models/Course.php |
| FR-1.d.v | Dynamic PDF certificate with user details and completion date | Certificate UUID, template rendering, and PDF download implemented. | Implemented | app/Http/Controllers/CertificateController.php, composer.json (dompdf) |
| FR-1.d.vi | Certificate via email and downloadable from platform | Completion notifier and download endpoint are implemented. | Implemented | app/Support/CourseCompletionNotifier.php, routes/web.php |
| FR-1.e.i | Dashboard to track individual progress across modules/lessons | Learner and admin dashboards include enrollment/progress status. | Implemented | app/Http/Controllers/DashboardController.php, app/Http/Controllers/Admin/CoursesController.php |
| FR-1.e.ii | Real-time analytics on completion, quiz performance, engagement | Analytics endpoints and dashboards are implemented with filterable data. | Implemented | app/Http/Controllers/Admin/AnalyticsController.php |
| FR-1.e.iii | Downloadable reports (CSV, PDF) for admin use | CSV exports are implemented; PDF report export not delivered as backend feature. | Partial | app/Http/Controllers/Admin/AnalyticsController.php, app/Http/Controllers/Admin/ActivityLogsController.php |
| FR-1.e.iv | Email reminders for incomplete modules/lessons/assessments | No scheduled reminder engine found in current baseline. | Gap | routes/web.php, app/Support (no reminder scheduler) |
| FR-1.f.i | Centralized admin interface for users/modules/lessons/assessments | Admin portal with dashboard, user, course, lesson, analytics, settings modules delivered. | Implemented | routes/web.php (admin group) |
| FR-1.f.ii | Search and filter for students/modules | Search/filter implemented for users and analytics datasets. | Implemented | app/Http/Controllers/Admin/UsersController.php, app/Http/Controllers/Admin/AnalyticsController.php |
| FR-1.f.iii | Audit logs for user activities/system changes | Admin activity logs and system logs with export/settings are implemented. | Implemented | app/Http/Controllers/Admin/ActivityLogsController.php, app/Http/Controllers/Admin/SystemLogsController.php |
| FR-1.f.iv | Ability to send mass email notifications to all users | No dedicated mass-mail campaign feature found in current baseline. | Gap | routes/web.php (no mass mail endpoint) |
| FR-1.g.i | MFA for all users | Implemented via email OTP workflow for learner/admin login. | Implemented | app/Http/Controllers/Auth/TwoFactorVerificationController.php |
| FR-1.g.ii | Data encryption for sensitive information | Password hashing and secure session/cookie controls are implemented; full at-rest field-level encryption not implemented by default. | Partial | app/Models/User.php, config/session.php |
| FR-1.g.iii | Regular automated backups for DB/system files | Backup process is deployment/infra responsibility; not fully automated by app scheduler in current baseline. | External | deploy.sh, operations environment |

## 6. Acceptance Notes for Requirement Gaps

The following items should be treated as post-baseline enhancements or deployment work packages:

- Bulk student import.
- Dedicated pre-assessment workflow.
- Short-answer auto/manual marking capability.
- Fixed global certification threshold at 40% (if mandatory by policy).
- PDF-format admin reporting.
- Automated learner reminder emails for incomplete learning.
- Mass notification broadcast to all users.
- Automated backup orchestration under operations runbook.

## 7. Functional Non-Regression Baseline

The following critical journeys are delivered and should be considered mandatory regression paths for UAT:

- Register -> Verify Email -> Profile Setup -> Enroll -> Learn -> Quiz -> Certificate.
- Admin Login (with 2FA) -> Manage Course/Lessons -> View Analytics -> Export CSV.
- User management lifecycle: role update, suspension, reset password.

## 8. Sign-Off Statement (Functional)

This document represents the delivered functional baseline as of the date above. Requirement items marked Partial, Gap, or External require formal acceptance decision, change request, or deployment-operation handoff to close before final contractual sign-off.
