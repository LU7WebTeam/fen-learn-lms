# Fen Learn LMS UAT Test Script

## 1) UAT Information
# Fen Learn LMS – UAT Test Script

## 1) UAT Information

| Field | Value |
|---|---|
| Live URL | https://fen-learn.fenetwork.my |
| Test environment | ☐ Production &nbsp; ☐ Staging |
| Test date | _______________ |
| Build / commit reference | _______________ |
| Test lead | _______________ |
| Testers | _______________ |
| Sign-off date | _______________ |
| Sign-off approver | _______________ |

## 2) UAT Goal

Validate end-to-end functional behavior for all user roles under production-like conditions. Tests must cover authentication, content access, the full learner learning flow (enrollment → lessons → quiz → certificate), admin operations, and cross-browser rendering before formal sign-off is granted.

## 3) Roles Covered

| Role | Entry Point | Description |
|---|---|---|
| Public | `/` | Unauthenticated visitor – can browse catalog and view public pages |
| Learner | `/login` | Registered and verified learner – can enroll and learn |
| Course Viewer | `/admin/login` | Read-only admin scoped to assigned courses |
| Superadmin | `/admin/login` | Full platform administrator |

## 4) Scope

### 4.1 In Scope
- All public-facing pages (landing, catalog, legal)
- Learner registration, email verification, and profile completion
- Full learner learning flow: enrollment → lessons (text, video, PDF) → quiz → certificate
- Course Viewer admin access and scope restrictions
- Superadmin course management, user management, analytics, logs, and settings
- Cross-browser rendering on the matrix defined in Section 12

### 4.2 Out of Scope
- Infrastructure and server performance/load testing
- Security penetration testing
- Third-party integrations not under platform control

## 5) Execution Rules

1. Record **Pass** or **Fail** for every test case. Leave no row blank.
2. For any **Fail**: capture a screenshot, record the exact URL, describe the actual result, and assign a severity.
3. Re-test every failed case after a fix is applied. Mark as **Retest-Pass** or **Retest-Fail**.
4. Do not share test account credentials in screenshots or exported reports.
5. Run all browser tests in Section 12 before sign-off.
6. Any **Critical** or **High** defect blocks sign-off until resolved and Retest-Passed.
7. **Medium/Low** defects require documented business approval to carry forward to go-live.

## 6) Test Environment and Data

### 6.1 Environment
- Use **incognito / private browsing** for all Public-role tests to prevent cached sessions from interfering.
- Clear browser cookies between test user sessions when switching roles.
- Conduct all tests against: https://fen-learn.fenetwork.my

### 6.2 Test Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Learner – complete profile | _______________ | _______________ | Active, verified, all profile fields complete |
| Learner – incomplete profile | _______________ | _______________ | Registered and verified but profile fields missing |
| Learner – suspended | _______________ | _______________ | Account status set to suspended |
| Course Viewer | _______________ | _______________ | Scoped to at least one test course |
| Superadmin | _______________ | _______________ | Full platform access |

### 6.3 Test Data Requirements

Before UAT begins, ensure the following data is in place:

- **Test course A** (used for learner flow): ≥2 sections; ≥1 text lesson; ≥1 video lesson; ≥1 PDF lesson; ≥1 scored quiz (passing score 70%, max 2 attempts, answer review **ON**); ≥1 informational quiz (no passing score). Sequential lesson locking must be enabled.
- **Test course B**: A second published course that the Course Viewer account is **not** assigned to (used for scope restriction tests).
- A test email inbox accessible in real time during UAT for receiving verification and password-reset emails.
- A registered but **unverified** learner account available for the email verification test (PUB-11).

## 7) Severity Definitions

| Severity | Definition | Sign-off Impact |
|---|---|---|
| Critical | Blocks a core user flow entirely (cannot log in, cannot enroll, cannot complete lesson, application crash) | **Blocks sign-off** |
| High | Major feature broken or produces incorrect data; workaround may exist but is unacceptable for production | **Blocks sign-off** |
| Medium | Visible defect or degraded UX; core function still works | Documented; business approval required to carry forward |
| Low | Minor cosmetic issue; no functional impact | Documented; can carry forward with notes |

---

## 8) Public UAT

**Pre-condition for all PUB tests:** Tester is not logged in. Use an incognito/private browsing session.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| PUB-01 | Home page load | 1. Open `/` in a supported browser; 2. Observe full page load; 3. Check hero, navigation, feature sections, and footer | Page loads without error; hero image and headline visible; navigation bar shows logo, EN/BM switcher, and Register/Login controls; footer present; no broken images or JS errors | Critical | | |
| PUB-02 | Language switch EN → BM | 1. Open `/`; 2. Click the **BM** language tab in the navigation; 3. Observe text across hero, feature sections, and navigation | All visible text updates to Bahasa Malaysia; layout remains intact; no untranslated placeholders or text overflow | High | | |
| PUB-03 | Language switch BM → EN | 1. While on BM locale, click the **EN** language tab; 2. Observe text | All text reverts to English; no layout regressions | Medium | | |
| PUB-04 | Legal pages | 1. Scroll to footer on `/`; 2. Click **Terms of Use** and confirm `/terms` loads; 3. Navigate back; 4. Click **Privacy Policy** and confirm `/privacy` loads; 5. Navigate to `/about` directly | All three pages load with readable content; layout intact; back navigation works | Medium | | |
| PUB-05 | Course catalog – public access | 1. Click **Courses** in navigation or go to `/courses`; 2. Observe the listing | Published courses appear with thumbnail, title, and description; unpublished courses are not visible; page loads without error | High | | |
| PUB-06 | Course detail page | 1. From `/courses`, click a published course; 2. Observe the detail page | Course title, description, and curriculum (sections and lessons) visible; individual lessons shown in locked state for unauthenticated visitor; Enroll / Start Learning button present | High | | |
| PUB-07 | Enroll redirects to auth | 1. On course detail page as a logged-out visitor, click **Enroll** or **Start Learning**; 2. Observe redirect | User is redirected to `/login` or `/register`; after successful login the user is returned to the intended course (redirect preserved) | High | | |
| PUB-08 | New learner registration | 1. Navigate to `/register`; 2. Enter a full name; 3. Enter a new unique email address; 4. Enter a valid password (min 8 chars, 1 uppercase letter, 1 special character); 5. Re-enter password in confirm field; 6. Complete the CAPTCHA widget; 7. Click **Register** | Account created; user redirected to the email verification notice page; a verification email arrives in the test inbox within 2 minutes | Critical | | |
| PUB-09 | Registration – password rule enforcement | 1. Navigate to `/register`; 2. Enter a password that does NOT meet requirements (e.g. all lowercase, no special character); 3. Attempt to submit | Inline validation error describes the password requirement; form does not submit; no account created | High | | |
| PUB-10 | Registration – duplicate email | 1. Navigate to `/register`; 2. Enter an email address that is already registered; 3. Complete remaining fields and submit | Error message indicates email is already in use; form does not create a duplicate account | High | | |
| PUB-11 | Email verification | 1. After PUB-08, open the verification email in the test inbox; 2. Click the verification link; 3. Observe the redirect | Account activated; user redirected to profile completion page or dashboard; no "please verify your email" banner shown after this point | Critical | | |
| PUB-11A | Cross-device email verification continuity | 1. On desktop, complete registration and remain on the verification notice page; 2. On mobile, open the same verification email and click the verification link; 3. Return to desktop and wait up to 10 seconds | Mobile link verifies successfully (no auth-session mismatch block); desktop verification notice clears automatically or allows continuation without restarting registration/login flow | Critical | | |
| PUB-12 | Staff login page separation | 1. Navigate to `/login`; 2. Observe the learner login page; 3. Navigate to `/admin/login`; 4. Observe the admin login page | Two distinct pages with appropriate branding; no cross-contamination between learner and staff login flows | High | | |

---

## 9) Learner UAT

### 9.1 Account and Access

**Pre-condition:** Use the test accounts defined in Section 6.2.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| LRN-01 | Valid learner login | 1. Navigate to `/login`; 2. Enter valid learner email; 3. Enter correct password; 4. Complete CAPTCHA; 5. Click **Sign In** | Login succeeds; user redirected to `/dashboard` or profile completion page; learner's name shown in navigation; no error messages displayed | Critical | | |
| LRN-02 | Invalid login – wrong password | 1. Navigate to `/login`; 2. Enter a valid email with an incorrect password; 3. Complete CAPTCHA; 4. Click **Sign In** | Error message shown; user remains on `/login`; no session created | High | | |
| LRN-03 | Invalid login – unregistered email | 1. Navigate to `/login`; 2. Enter an email not registered in the system; 3. Enter any password; 4. Complete CAPTCHA; 5. Click **Sign In** | Generic authentication error shown (does not distinguish between wrong email vs wrong password); no login | High | | |
| LRN-04 | Forgot password flow | 1. Navigate to `/forgot-password`; 2. Enter a registered learner email; 3. Complete CAPTCHA; 4. Click **Send Reset Link**; 5. Open the reset email in the test inbox; 6. Click the reset link; 7. Enter a new password meeting all requirements; 8. Confirm the new password; 9. Submit; 10. Log in using the new password | Reset email arrives within 2 minutes; reset link opens the correct page and is valid for one use; new password accepted; login with new password succeeds; old password no longer works | Critical | | |
| LRN-05 | Profile completion gate | 1. Log in with the incomplete-profile learner account; 2. Observe the redirect; 3. Attempt to navigate directly to `/dashboard` via the URL bar | User is redirected to the profile completion page; direct navigation to any learning route is blocked until the profile is fully complete | High | | |
| LRN-06 | Complete profile | 1. On the profile completion page, fill in all required fields (certificate name, IC/passport, organisation/state as applicable); 2. Click **Save** or **Complete Profile** | Profile saved; user redirected to the learner dashboard; profile completion gate is not triggered on subsequent logins | High | | |
| LRN-07 | Suspended learner block | 1. Attempt to log in using the suspended learner account credentials | Login blocked; clear suspension message displayed; no session created; any attempt to navigate to learning routes while logged out returns to login | Critical | | |

### 9.2 Enrollment and Learning Journey

**Pre-condition:** Logged in as the active learner with a complete profile unless otherwise noted.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| LRN-08 | Enroll in course | 1. Navigate to `/courses/{test-course-A-slug}`; 2. Click **Enroll** or **Start Learning**; 3. Confirm any enrollment dialog if shown | Enrollment created; Test Course A appears on the learner dashboard under enrolled courses; progress shows 0% | Critical | | |
| LRN-09 | Resume learning from dashboard | 1. On the learner dashboard, find Test Course A; 2. Click **Resume** or **Continue** | Learner is taken to the last in-progress or next available lesson; lesson player loads correctly | High | | |
| LRN-10 | Locked lesson – sidebar | 1. In the lesson sidebar, identify a lesson that is locked (its prerequisite is not yet complete); 2. Click the locked lesson title | Lesson does not open; a locked indicator is shown in the sidebar; tester remains on the current lesson or sees an access-denied message | High | | |
| LRN-11 | Locked lesson – direct URL bypass | 1. Copy the URL of a locked lesson; 2. Paste it into the browser address bar and navigate | Access blocked; user is redirected to the appropriate lesson or shown a locked/unavailable state; content of the locked lesson is not rendered | High | | |
| LRN-12 | Text lesson completion | 1. Open an incomplete text lesson; 2. Scroll through the content; 3. Click **Mark as Complete** or equivalent | Lesson marked complete; checkmark or completion indicator appears in the sidebar; course progress percentage increments; next lesson unlocks if sequential | High | | |
| LRN-13 | Video lesson completion | 1. Open a video lesson; 2. Play the video through to the end (or to the configured completion threshold); 3. Observe completion trigger | Lesson marked complete automatically at end of video or on button click; progress percentage updates; sidebar completion indicator appears | High | | |
| LRN-14 | PDF lesson rendering | 1. Open a PDF lesson; 2. Observe the PDF content display; 3. If a download button is present, click it | PDF content renders clearly in-browser or a download is offered; document is readable; no broken display or missing pages | Medium | | |
| LRN-15 | Next / Previous lesson navigation | 1. Open any lesson; 2. Click **Next Lesson**; 3. Confirm the correct next lesson loads; 4. Click **Previous Lesson**; 5. Confirm the previous lesson loads | Lessons load in the correct sequential order in both directions; URL updates accordingly; no full page reload required | High | | |
| LRN-16 | Progress accuracy | 1. Complete exactly half the lessons in Test Course A (e.g. 3 of 6); 2. Return to the learner dashboard; 3. Read the progress percentage displayed for the course | Progress percentage matches the completed-to-total ratio (e.g. 50%); value does not exceed 100% and does not show 0% incorrectly | High | | |

### 9.3 Quiz Journey

**Pre-condition:** Logged in as learner; Test Course A has quizzes configured as described in Section 6.3.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| LRN-17 | Quiz attempt – passing score | 1. Navigate to the scored quiz lesson in Test Course A; 2. Answer all questions to achieve a score ≥ the passing threshold (e.g. 7/10 on a 70% pass mark); 3. Click **Submit** | Score and percentage calculated correctly; result modal opens showing pass state, score (e.g. "7 / 10"), and percentage | Critical | | |
| LRN-18 | Quiz attempt – failing score | 1. Navigate to the scored quiz with attempts remaining; 2. Answer enough questions incorrectly to score below the pass mark; 3. Click **Submit** | Fail state shown in result modal; correct score and percentage displayed; **Try Again** button visible (attempts remaining) | High | | |
| LRN-19 | Result modal – all elements present | 1. Submit any scored quiz; 2. Inspect the result modal | Modal contains all of: score, percentage, pass/fail label, outcome image appropriate to the result, and navigation controls (Try Again / Next Lesson / Back to Course) | High | | |
| LRN-20 | Passed outcome image | 1. Submit the quiz with a score at or above the pass mark; 2. Inspect the modal image | The passing-state outcome image is displayed; the failing-state image is not shown | Medium | | |
| LRN-21 | Failed outcome image | 1. Submit the quiz with a score below the pass mark; 2. Inspect the modal image | The failing-state outcome image is displayed; the passing-state image is not shown | Medium | | |
| LRN-22 | Informational quiz outcome | 1. Navigate to the informational quiz lesson (no passing score configured); 2. Submit any answers | Result modal shows a "Completed" state with no pass/fail framing; lesson marked complete; no blocking on course progress | High | | |
| LRN-23 | Retry after fail | 1. After failing the scored quiz (with one attempt remaining), click **Try Again** in the result modal; 2. Observe the quiz state | A new, blank attempt starts; all previous answers are cleared; attempt counter decrements (e.g. now shows "Attempt 2 of 2") | High | | |
| LRN-23A | Retry returns to active quiz form | 1. Fail a scored quiz with attempts remaining; 2. Click **Try Again**; 3. Observe the lesson immediately after modal closes | Result state is dismissed; learner is returned to active quiz questions (not the previous result view); submit button is available after re-answering | High | | |
| LRN-24 | Attempt limit enforced | 1. Exhaust all allowed attempts on the scored quiz (fail twice on the 2-attempt quiz); 2. Return to the quiz lesson page | **Try Again** is not shown; a message clearly states that all attempts have been used; the score from the last attempt is visible; no way to start a new attempt through the UI | Critical | | |
| LRN-25 | Answer review – enabled | 1. Submit the scored quiz (answer review configured ON); 2. Access the review from the result modal or lesson page | Each question displayed with: the learner's selected answer, the correct answer, and a correct/incorrect indicator | High | | |
| LRN-26 | Answer review – disabled | 1. Configure (or use) a quiz with answer review toggled OFF; 2. Submit the quiz; 3. Observe the result modal and the lesson page after dismissal | Score and pass/fail state shown; individual question review UI is not accessible; no button or link to view per-question breakdown | High | | |

### 9.4 Completion and Certificate

**Pre-condition:** All required lessons in Test Course A completed, including the scored quiz passed.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| LRN-27 | Course completion status | 1. Complete the last required item in Test Course A; 2. Check the course status on the learner dashboard; 3. Observe the progress indicator | Course marked as **Completed**; progress shows 100%; completion date/timestamp recorded and visible | Critical | | |
| LRN-28 | Certificate view | 1. Open the completed course or navigate to the certificate from the learner dashboard; 2. View the certificate page | Certificate renders correctly; no broken layout; learner name, course title, and completion date all visible | Critical | | |
| LRN-29 | Certificate name accuracy | 1. Note the exact name entered in the learner's profile certificate-name field; 2. Compare it to the name shown on the certificate | Name on certificate exactly matches the profile certificate-name field (not the account username or email address) | Critical | | |
| LRN-30 | Certificate download | 1. On the certificate view page, click **Download PDF**; 2. Open the downloaded file in a PDF viewer | PDF downloads successfully; opens without error; name, course title, and date match the on-screen certificate; no blank pages or missing content | High | | |

---

## 10) Course Viewer UAT

**Pre-condition:** Log in via `/admin/login` using the Course Viewer test account. This account must be scoped to Test Course A and must NOT be scoped to Test Course B.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| CVW-01 | Login as Course Viewer | 1. Navigate to `/admin/login`; 2. Enter Course Viewer credentials; 3. Click **Sign In** | Login succeeds; admin interface loads; navigation shows only modules accessible to this role | Critical | | |
| CVW-02 | Dashboard visibility | 1. After login, navigate to `/admin/dashboard` | Dashboard loads; metrics visible are scoped to assigned course(s) only; no full-platform aggregates exposed | High | | |
| CVW-03 | Assigned course accessible | 1. Navigate to Test Course A in the admin panel | Course details, sections, and lesson list are visible and readable | High | | |
| CVW-04 | Unassigned course blocked via URL | 1. Identify the admin URL for Test Course B (not assigned to this viewer); 2. Paste the URL directly into the browser | Access denied (403 response, redirect to dashboard, or content hidden); no data from Test Course B is exposed | Critical | | |
| CVW-05 | Read-only: course edit blocked | 1. Open Test Course A in the admin panel; 2. Attempt to edit any course field (title, description, status) and click Save | Edit/save controls are either hidden or disabled; no changes are persisted; no success message shown | Critical | | |
| CVW-06 | Read-only: lesson edit blocked | 1. Open a lesson within Test Course A; 2. Attempt to edit the lesson title or content; 3. Attempt to create a new lesson; 4. Attempt to delete or reorder a lesson | All mutating actions (edit, create, delete, reorder, duplicate) are blocked or absent from the UI | Critical | | |
| CVW-07 | Restricted module – users | 1. Attempt to navigate to `/admin/users` (via URL or navigation) | Access denied; 403 response or redirect to dashboard; user list data not exposed | Critical | | |
| CVW-08 | Restricted module – settings | 1. Attempt to navigate to `/admin/settings` (via URL or navigation) | Access denied; 403 response or redirect to dashboard | Critical | | |
| CVW-09 | Analytics page – scoped access | 1. Navigate to `/admin/analytics` | Analytics page loads; data visible only for Test Course A; no data from Test Course B or any other course exposed | Critical | | |
| CVW-10 | Analytics filters | 1. Apply a date range filter; 2. Apply any available profile/demographic filter; 3. Observe charts and table | Charts and learner table update to reflect the selected filters; totals consistent with visible data; all results remain within the assigned course scope | High | | |
| CVW-11 | Analytics tabs / views | 1. Switch between all available analytics tabs or summary/table views | Each view loads correctly; counts are consistent across views; no unauthorized data from other courses is visible | High | | |
| CVW-12 | Analytics CSV export | 1. Click the Export CSV action from the analytics page; 2. Open the downloaded file | CSV file downloads and opens correctly; data matches on-screen analytics; only Test Course A data is included; no cross-course rows present | High | | |

---

## 11) Superadmin UAT

### 11.1 Admin Core

**Pre-condition:** Logged in via `/admin/login` as Superadmin.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| SUP-01 | Superadmin login | 1. Navigate to `/admin/login`; 2. Enter Superadmin credentials; 3. Click **Sign In** | Login succeeds; full admin interface loads; all navigation modules present and accessible | Critical | | |
| SUP-02 | Dashboard | 1. Navigate to `/admin/dashboard` | Platform-wide metrics and summary cards load correctly; no blank cards or error states | High | | |
| SUP-03 | Admin documentation | 1. Navigate to `/admin/docs` | Documentation page loads; content readable and complete | Low | | |

### 11.2 Course and Lesson Management

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| SUP-04 | Create course | 1. Navigate to the courses list; 2. Click **Create Course**; 3. Fill in all required fields (title, description, thumbnail); 4. Save | Course created and appears in the course list; accessible via its slug; status defaults to unpublished | High | | |
| SUP-05 | Publish course | 1. Open a draft course; 2. Set status to **Published**; 3. Save; 4. Open `/courses` in a new private window as a public user | Course appears in the public catalog; course detail page is accessible | Critical | | |
| SUP-06 | Unpublish course | 1. Set a published course to **Unpublished**; 2. Save; 3. Reload `/courses` as a public user | Course no longer visible in the public catalog; navigating directly to its URL returns not-found or access denied | High | | |
| SUP-07 | Section operations | 1. Create a new section; 2. Rename it; 3. Reorder it using drag or move controls; 4. Duplicate it; 5. Delete the duplicate | All operations complete without error; changes persist after page refresh; no orphaned or duplicate sections in the final state | High | | |
| SUP-08 | Lesson operations | 1. Create one text lesson, one video lesson, and one PDF lesson; 2. Edit each lesson title; 3. Reorder the lessons; 4. Duplicate one lesson; 5. Delete the duplicate | All operations persist; lesson order in the admin panel matches the learner-facing course view | High | | |
| SUP-09 | Quiz configuration | 1. Open a quiz lesson; 2. Set passing score to 70%; 3. Set max attempts to 2; 4. Toggle answer review to ON; 5. Add a description; 6. Save; 7. Log in as learner and submit the quiz | Learner quiz behavior matches configured settings: correct pass threshold applied, attempt limit enforced after 2 attempts, answer review accessible after submission | Critical | | |

### 11.3 Users and Access Control

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| SUP-10 | User list and search | 1. Navigate to `/admin/users`; 2. Search for a learner by name; 3. Apply a role filter | Results update correctly and display accurate user records; search and filter work independently and in combination | High | | |
| SUP-11 | Role change | 1. Open a learner's user record; 2. Change the role to course_viewer; 3. Save; 4. Log in as that user | Role updated; user now has Course Viewer access; previous learner dashboard is no longer accessible | Critical | | |
| SUP-12 | Course access assignment | 1. Assign Test Course A to a course_viewer user; 2. Log in as that user and attempt to access Test Course B | Viewer can access only the assigned course (Test Course A); Test Course B returns access denied | Critical | | |
| SUP-13 | Suspend user | 1. Suspend a learner account from the admin panel; 2. Attempt to log in as that learner | Login blocked with a clear suspension message; no session created | High | | |
| SUP-14 | Unsuspend user | 1. Unsuspend the account suspended in SUP-13; 2. Log in as that learner | Login now succeeds; learner access fully restored | High | | |
| SUP-15 | Admin password reset | 1. Use the **Reset Password** action on a user record; 2. Log in as that user using the new credentials | New password accepted; login succeeds | High | | |
| SUP-16 | Send password reset link | 1. Use the **Send Password Reset Link** action for a user; 2. Open the reset email in the test inbox; 3. Follow the reset flow | Reset email arrives within 2 minutes; link is valid and single-use; user can set and log in with a new password | High | | |
| SUP-17 | Deletion safeguard – own account | 1. As Superadmin, attempt to delete your own account from the user list | Action blocked; error message states that self-deletion is not permitted | Critical | | |
| SUP-18 | Deletion safeguard – last superadmin | 1. Ensure only one superadmin account exists; 2. Attempt to delete that account | Action blocked; error states that the last superadmin account cannot be deleted | Critical | | |

### 11.4 Analytics, Logs, and Settings

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| SUP-19 | Analytics – date filter | 1. Navigate to `/admin/analytics`; 2. Set a custom date range; 3. Observe charts and learner table | Data updates to reflect the selected period; no records outside the date range are shown | High | | |
| SUP-20 | Analytics – course filter | 1. Apply a course filter on the analytics page; 2. Observe charts and table | Only data for the selected course is displayed; platform totals update accordingly | High | | |
| SUP-21 | Analytics CSV export | 1. Click **Export CSV** from the analytics page; 2. Open the downloaded file | File downloads; column headers are correct; row data matches on-screen figures; no empty or corrupted rows | High | | |
| SUP-22 | Activity logs | 1. Navigate to `/admin/activity-logs`; 2. Apply available filters (date, actor, action type); 3. Export the log | Logs render with timestamps, actor name, and action description; filters narrow results correctly; export downloads a valid file | Medium | | |
| SUP-23 | System logs | 1. Navigate to `/admin/system-logs`; 2. View the log entries; 3. Export | Log entries visible with timestamps and severity; export functional and produces a valid file | Medium | | |
| SUP-24 | Branding settings | 1. Update the platform name or logo in settings; 2. Save; 3. Reload public-facing pages | Changes reflect on the public UI and, where applicable, in outgoing email headers/templates | Medium | | |
| SUP-25 | Email – send test email | 1. Navigate to email settings; 2. Send a test email to a reachable inbox | Email arrives; sender name and address match configured branding; no raw HTML or template errors visible in the email body | High | | |
| SUP-26 | Email – template test | 1. Send a template test email from settings | Email renders with correct template styling; all images and links intact; no broken layout | Medium | | |
| SUP-27 | Captcha settings test | 1. Navigate to captcha settings; 2. Run the built-in captcha test | Test returns a clear pass or fail indicator consistent with the configured captcha provider; no unhandled error | Medium | | |
| SUP-28 | Maintenance mode | 1. Enable maintenance mode; 2. Open `/` in a private window as a non-admin visitor; 3. Disable maintenance mode; 4. Reload `/` as the same non-admin visitor | During maintenance: public routes display a maintenance message; admin interface at `/admin` remains accessible. After disable: public site restores to normal immediately | High | | |

---

## 12) Browser Testing (Required)

### 12.1 Browser Matrix

| ID | Device Type | Device / Model | OS | Browser | Version | Viewport | Test Method | Tester | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| BRW-01 | Desktop | Windows laptop/PC | Windows 11 | Chrome (Stable) | Latest | 1920×1080 | Real device | | | |
| BRW-02 | Desktop | Windows laptop/PC | Windows 11 | Edge (Stable) | Latest | 1920×1080 | Real device | | | |
| BRW-03 | Desktop | MacBook/iMac | macOS | Safari | Latest | 1440×900 or native | Real device | | | |
| BRW-04 | Desktop | MacBook/iMac | macOS | Chrome (Stable) | Latest | 1440×900 or native | Real device | | | |
| BRW-05 | Mobile | iPhone 13/14/15 or newer | iOS | Safari | Latest | 390×844 or native | Real device preferred | | | |
| BRW-06 | Mobile | iPhone 13/14/15 or newer | iOS | Chrome | Latest | 390×844 or native | Real device preferred | | | |
| BRW-07 | Mobile | Pixel / Samsung mid-high tier | Android 13+ | Chrome | Latest | 360×800 or native | Real device preferred | | | |
| BRW-08 | Tablet | iPad 9th gen or newer | iPadOS | Safari | Latest | 820×1180 or native | Real device preferred | | | |

**Sign-off minimums:**
- All Desktop rows must be tested on real devices.
- At least one iOS Mobile row and one Android Mobile row must be tested on real devices.
- Any row run on a simulator or emulator must be documented clearly in Notes.
- If Safari is unavailable, record the reason, risk impact, and obtain explicit business approval before sign-off.

### 12.2 Browser Test Cases

Execute the following test cases on each browser in the matrix. Record pass/fail per browser in the Notes column.

| ID | Scenario | Steps | Expected Result | Severity if Fail | Status | Notes |
|---|---|---|---|---|---|---|
| BRW-TC-01 | Public landing render | 1. Open `/`; 2. Inspect hero, navigation, feature sections, and footer | Layout, typography, and images render correctly; no overlap, clipping, or text truncation; no console errors | High | | |
| BRW-TC-02 | Mobile navigation | 1. Open `/` at mobile viewport width (≤ 430px); 2. Interact with the Register/Login dropdown; 3. Use the EN/BM switcher | Mobile navigation controls functional; dropdown opens and dismisses correctly; no elements extend off-screen or become unreachable | High | | |
| BRW-TC-03 | Course catalog and detail | 1. Open `/courses`; 2. Click a course to open its detail page | Catalog and detail page render consistently; thumbnails load; curriculum accordion is functional | High | | |
| BRW-TC-04 | Learner login and dashboard | 1. Log in as learner via `/login`; 2. Open the dashboard | Authentication flow completes; dashboard renders with enrolled courses visible | High | | |
| BRW-TC-05 | Lesson player – all types | 1. Open a text lesson; 2. Open a video lesson; 3. Open a PDF lesson (all within one enrolled course) | Content renders for each lesson type; lesson navigation buttons work; no JS errors blocking display or playback | High | | |
| BRW-TC-06 | Quiz submit and result modal | 1. Submit a quiz; 2. Observe the result modal | Modal opens correctly; score visible; outcome image not clipped or hidden; all modal controls (Try Again / Next / Close) are usable | High | | |
| BRW-TC-07 | Language switch | 1. Toggle EN→BM from the landing page; 2. Toggle EN→BM from the learner dashboard | Strings update correctly in both contexts; no truncated or overflowing text in either language | Medium | | |
| BRW-TC-08 | Responsive layout | 1. Resize the browser between mobile (~390px) and desktop (≥1024px) widths; 2. Check key pages (landing, course catalog, lesson player) | No elements overlap or become inaccessible at any tested width; critical actions remain visible and functional throughout | Medium | | |

### 12.3 Browser Pass Criteria

- No Critical or High UI/functional defects on any required browser.
- Core flows pass on all required browsers: public discovery, learner login and dashboard, lesson player (all types), quiz submit and result modal, admin login.
- Medium/Low browser-specific defects must be documented with a workaround and accepted by the business owner before sign-off.

---

## 13) Defect Log

Use this template for every failed test case:

```
Defect ID:          UAT-XXX
Test Case ID:       (e.g. LRN-17)
Role:               Public / Learner / Course Viewer / Superadmin
Module:             (e.g. Quiz Player)
URL:
Environment:        (browser name + version, OS, viewport width)

Steps to Reproduce:
	1.
	2.
	3.

Expected Result:
Actual Result:
Screenshot:         [attach file]

Severity:           Critical / High / Medium / Low
Reported by:
Date reported:
Status:             Open / In Fix / Retest-Pass / Retest-Fail
```

---

## 14) UAT Sign-off

Complete this section only after all test cases have been executed and all Critical and High defects are resolved.

| Metric | Count |
|---|---|
| Total test cases executed | |
| Passed | |
| Failed | |
| Retest-Passed | |
| Open defects – Critical / High | |
| Open defects – Medium / Low | |

**Sign-off declaration:**
All Critical and High defects have been resolved and marked Retest-Pass. Any remaining Medium/Low defects are documented, risk-accepted, and approved by the business owner. The platform is approved for go-live.

| Role | Name | Signature | Date |
|---|---|---|---|
| Test Lead | | | |
| Business Owner | | | |
| Technical Lead | | | |

---

*Document version: 2.0 – revised May 2026*

## 12) Sign-Off Criteria

- All Critical defects closed.
- All High defects closed or formally accepted by business owner.
- Core flows pass for all four user types.
- Required browser matrix is completed and signed off.
- UAT sign-off recorded with approver name and date.

## 13) Optional Fast-Track Plan (If Time Is Limited Today)

Run these first as a minimum go-live confidence set:

- Public: PUB-01, PUB-04, PUB-06
- Learner: LRN-01, LRN-06, LRN-12, LRN-13, LRN-19, LRN-21
- Course Viewer: CVW-03, CVW-04, CVW-08, CVW-09, CVW-10
- Superadmin: SUP-05, SUP-08, SUP-10, SUP-15, SUP-19
