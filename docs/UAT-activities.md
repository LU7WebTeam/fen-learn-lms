# Fen Learn LMS UAT Test Script

## 1) UAT Information
- Live URL: https://fen-learn.fenetwork.my
- Test date: __________________
- Build/commit reference: __________________
- Test lead: __________________
- Testers: __________________

## 2) UAT Goal
Validate end-to-end behavior for key roles in production-like conditions before sign-off.

## 3) Roles Covered
- Public
- Learners
- Course Viewers
- Superadmin

## 4) Execution Rules
- Record Pass/Fail for each test case.
- For any Fail, capture screenshot and exact URL.
- Include actual result and severity (Critical/High/Medium/Low).
- Re-test failed cases after fix and mark as Retest-Pass/Retest-Fail.
- Execute cross-browser tests in Section 10 before sign-off.

## 5) Suggested Test Accounts
- Learner account: __________________
- Course Viewer account: __________________
- Superadmin account: __________________
- Test course slug: __________________

## 6) Public UAT

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| PUB-01 | Home page load | Open `/` | Home page loads without error; hero, navigation, and sections render correctly |  |  |
| PUB-02 | Language switch | Switch EN/BM from landing | Text changes language across key landing sections; no broken layout |  |  |
| PUB-03 | Legal pages | Open `/about`, `/terms`, `/privacy` | All pages load and content is readable |  |  |
| PUB-04 | Course catalog access | Open `/courses` | Course list loads for public user |  |  |
| PUB-05 | Course detail access | Open a published course detail page | Detail page renders with lesson/curriculum preview |  |  |
| PUB-06 | Enroll requires auth | From course detail, click enroll/start as logged-out user | User is redirected to login/register flow |  |  |
| PUB-07 | Staff login separation | Open `/admin/login` and `/login` | Separate staff and learner login pages are accessible and clear |  |  |

## 7) Learner UAT

### 7.1 Account and Access

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| LRN-01 | Learner login | Login via `/login` | Login succeeds for valid learner account |  |  |
| LRN-02 | Invalid login handling | Login with invalid password | Error shown, no login |  |  |
| LRN-03 | Forgot password flow | Run forgot-password flow | Reset email flow works and user can log in with new password |  |  |
| LRN-04 | Profile completion gate | Login with incomplete profile account | User is prompted to complete profile before learning routes |  |  |
| LRN-05 | Suspended learner block | Try login with suspended learner | Access is blocked with clear message |  |  |

### 7.2 Enrollment and Learning Journey

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| LRN-06 | Enroll in course | Enroll in published course | Enrollment succeeds and course appears on learner dashboard |  |  |
| LRN-07 | Resume learning | Open enrolled course and resume | Learner lands in correct lesson player route |  |  |
| LRN-08 | Locked lesson behavior | Attempt to open locked lesson before prerequisite | Locked behavior is enforced and user cannot bypass |  |  |
| LRN-09 | Text lesson completion | Complete a text lesson | Lesson marked complete; progress increments |  |  |
| LRN-10 | Video lesson completion | Watch/complete a video lesson | Completion updates correctly |  |  |
| LRN-11 | PDF lesson rendering | Open PDF lesson | PDF content displays/download opens correctly |  |  |

### 7.3 Quiz Journey

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| LRN-12 | Standard quiz submit | Submit valid answers on scored quiz | Score and percentage are calculated and shown |  |  |
| LRN-13 | Quiz result modal | Submit quiz and observe result modal | Modal opens, shows score and pass/fail state correctly |  |  |
| LRN-14 | Outcome image mapping | Test passed and failed outcomes | Correct image appears for passed and failed states |  |  |
| LRN-15 | Informational quiz outcome | Submit quiz with no passing score (if configured) | Completed/informational outcome displays correctly |  |  |
| LRN-16 | Retry control | Fail quiz with attempts remaining | Try Again option appears and allows new attempt |  |  |
| LRN-17 | Attempt limit enforcement | Exhaust max attempts | Further attempt is blocked and message is shown |  |  |
| LRN-18 | Answer-review toggle off | Use quiz with review disabled | Marks visible but answer review is hidden |  |  |

### 7.4 Completion and Certificate

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| LRN-19 | Course completion status | Finish all required lessons | Course marked completed |  |  |
| LRN-20 | Certificate view | Open generated certificate page | Certificate loads with correct learner/course/date data |  |  |
| LRN-21 | Certificate download | Download certificate PDF | PDF downloads and content is valid |  |  |

## 8) Course Viewer UAT

Course Viewer should have admin-panel access that is read-only and scoped to assigned courses.

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| CVW-01 | Admin login | Login via `/admin/login` with course_viewer role | Login succeeds and admin interface loads |  |  |
| CVW-02 | Dashboard visibility | Open admin dashboard | Read-only dashboard access works |  |  |
| CVW-03 | Course scope restriction | Attempt to access unassigned course pages by URL | Access denied or content hidden based on scope rules |  |  |
| CVW-04 | Read-only enforcement: courses | Open assigned course edit pages and attempt updates | Save/update controls are blocked or unavailable |  |  |
| CVW-05 | Read-only enforcement: lessons | Open lesson edit pages and attempt changes | Edit, create, delete, reorder actions are blocked |  |  |
| CVW-06 | Restricted modules | Try to access users/settings routes under `/admin` | Access denied (403/redirect/hidden UI) |  |  |
| CVW-07 | Analytics page visibility | Open `/admin/analytics` as course_viewer | Analytics page loads only for assigned-course scope and without privilege escalation |  |  |
| CVW-08 | Course analytics filters | Apply date/course/profile filters in analytics | Filtered charts/table update correctly and only include allowed course scope |  |  |
| CVW-09 | Course analytics tabs | Switch between analytics tabs/cards/views (summary + table areas) | Tabs/views load correctly with consistent counts and no unauthorized data exposure |  |  |
| CVW-10 | Course analytics CSV export | Export analytics CSV from course_viewer account | CSV downloads successfully and contains only permitted scoped analytics data |  |  |

## 9) Superadmin UAT

### 9.1 Admin Core

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| SUP-01 | Superadmin login | Login via `/admin/login` | Login succeeds with full access |  |  |
| SUP-02 | Dashboard | Open `/admin/dashboard` | Metrics and cards load correctly |  |  |
| SUP-03 | Admin docs | Open `/admin/docs` | Documentation page loads correctly |  |  |

### 9.2 Course and Lesson Management

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| SUP-04 | Create course | Create new course with required fields | Course is created and listed |  |  |
| SUP-05 | Edit/publish course | Edit and publish/unpublish a course | Visibility changes reflect on public catalog |  |  |
| SUP-06 | Section operations | Create, rename, reorder, duplicate, delete section | All section actions persist correctly |  |  |
| SUP-07 | Lesson operations | Create/edit/reorder/duplicate/delete lessons | Lesson actions persist correctly and display in learner flow |  |  |
| SUP-08 | Quiz authoring options | Configure passing score, attempts, description, answer-review toggle | Learner quiz behavior matches configured settings |  |  |

### 9.3 Users and Access Control

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| SUP-09 | Users list and search | Open `/admin/users`, filter/search | Data loads and filters work correctly |  |  |
| SUP-10 | Role change | Change user role (learner/content_editor/course_viewer/super_admin) | Role updates and permissions apply correctly |  |  |
| SUP-11 | Course access assignment | Assign course scope to course_viewer | Viewer can only access assigned courses |  |  |
| SUP-12 | Suspend/unsuspend | Suspend and unsuspend a user | User access behavior updates immediately |  |  |
| SUP-13 | Password reset actions | Use admin reset password and send reset link actions | Actions succeed and user can authenticate accordingly |  |  |
| SUP-14 | Deletion safeguards | Attempt delete own superadmin or last superadmin | Protected paths are blocked by safeguard logic |  |  |

### 9.4 Analytics, Logs, and Settings

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| SUP-15 | Analytics filters | Use date/course/profile filters in `/admin/analytics` | Charts and table update consistently |  |  |
| SUP-16 | Analytics export | Export analytics CSV | File downloads and values match on-screen data |  |  |
| SUP-17 | Activity logs | Open `/admin/activity-logs`, apply controls, export | Logs render and exports work |  |  |
| SUP-18 | System logs | Open `/admin/system-logs` and export | System logs display and export works |  |  |
| SUP-19 | Branding settings | Update platform branding and save | Changes reflect on UI and emails where applicable |  |  |
| SUP-20 | Email settings tests | Send test email and template test email | Test email arrives and template renders correctly |  |  |
| SUP-21 | Captcha test endpoint | Run captcha test from settings | Captcha validation behaves as configured |  |  |
| SUP-22 | Maintenance mode | Toggle maintenance mode (during controlled test window) | Public routes show maintenance behavior; admins can still manage |  |  |

## 10) Browser Testing (Required)

### 10.1 Browser Matrix

| ID | Device Type | Device / Model | OS | Browser Type | Browser Version | Viewport / Resolution | Test Method | Tester | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| BRW-01 | Desktop | Windows laptop/PC | Windows 11 | Chrome (Stable) | Latest | 1920x1080 | Real device |  |  |  |
| BRW-02 | Desktop | Windows laptop/PC | Windows 11 | Edge (Stable) | Latest | 1920x1080 | Real device |  |  |  |
| BRW-03 | Desktop | MacBook/iMac | macOS | Safari | Latest | 1440x900 or native | Real device |  |  |  |
| BRW-04 | Desktop | MacBook/iMac | macOS | Chrome (Stable) | Latest | 1440x900 or native | Real device |  |  |  |
| BRW-05 | Mobile Phone | iPhone 13/14/15 (or newer) | iOS | Safari | Latest | 390x844 (or native) | Real device preferred |  |  |  |
| BRW-06 | Mobile Phone | iPhone 13/14/15 (or newer) | iOS | Chrome | Latest | 390x844 (or native) | Real device preferred |  |  |  |
| BRW-07 | Mobile Phone | Pixel/Samsung mid-high tier | Android 13+ | Chrome | Latest | 360x800 (or native) | Real device preferred |  |  |  |
| BRW-08 | Tablet | iPad (9th gen or newer) | iPadOS | Safari | Latest | 820x1180 (or native) | Real device preferred |  |  |  |

Required minimum for sign-off:
- All Desktop rows must be tested on real devices.
- At least one iOS mobile and one Android mobile row must be tested on real devices.
- If any row is run using simulator/emulator, record it clearly in Notes.

If Safari testing is unavailable, record reason, risk impact, and obtain explicit business approval before sign-off.

### 10.2 Browser Test Cases

| ID | Scenario | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| BRW-TC-01 | Public landing render | Open `/` on each browser in matrix | Layout, typography, and images render correctly with no overlap/clipping |  |  |
| BRW-TC-02 | Public course discovery | Open `/courses`, open one course detail page | Catalog and detail UI function consistently across browsers |  |  |
| BRW-TC-03 | Learner login + dashboard | Login as learner and open dashboard | Authentication and dashboard rendering are stable |  |  |
| BRW-TC-04 | Lesson player flow | Open text/video/pdf lessons in one enrolled course | Lesson content works, navigation works, no major UI breakage |  |  |
| BRW-TC-05 | Quiz submit + modal | Submit quiz and observe result modal | Modal opens, score visible, image not clipped, controls usable |  |  |
| BRW-TC-06 | Language switch | Toggle EN/BM from landing and learner page | Strings update correctly, no truncation causing layout issues |  |  |
| BRW-TC-07 | Responsive checks | Validate key pages at mobile and desktop widths | Critical actions remain accessible and readable |  |  |

### 10.3 Browser Pass Criteria

- No Critical or High UI/function defects in any required browser.
- Core flows pass on all required browsers: public discovery, learner learning flow, quiz submission/result modal, and admin login.
- Any Medium/Low browser-specific defects are documented with workaround and accepted by business owner.

## 11) Defect Log Format

Use this template for each failed UAT case:

- ID: UAT-XXX
- Test Case ID: (example LRN-13)
- Role: Public/Learner/Course Viewer/Superadmin
- Module: (example Quiz Player)
- URL:
- Steps to Reproduce:
- Expected Result:
- Actual Result:
- Severity: Critical/High/Medium/Low
- Evidence: Screenshot/Video
- Status: Open/In Progress/Retest/Closed
- Owner:

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
