# Finalised Technical / Design Document

Version: 1.0 (Project Delivery Baseline)  
Date: 2026-05-21  
Project: FEN Learn LMS (Expansion and Hosting of FEN PROAKTIF)

## 1. Document Objective

This document finalizes the delivered technical architecture and design baseline for production handover.

It covers:

- architecture and component design,
- data and security design,
- hosting/deployment alignment with user technical requirements,
- operational maintenance baseline and risks.

## 2. Technical Requirement Alignment Summary

| Area | User Requirement Summary | Final Design Position |
|---|---|---|
| Hosting environment | Deploy on PROAKTIF domain, PHP 8+, MySQL 5.7+, Apache/Nginx, SSL | Compatible. App is Laravel/PHP and supports MySQL. SSL terminates at web server/proxy. |
| Technology stack | PHP-based custom system, MySQL, responsive frontend | Delivered with Laravel + Inertia + React frontend and responsive UI. |
| Security frameworks | CSRF, XSS filtering, SQL injection prevention | Core Laravel protections and validation/query builder patterns applied. |
| Performance | Support concurrent users, caching, optimization, monitoring | Code supports optimization/caching patterns; formal load benchmark requires infra test execution. |
| Deployment and maintenance | setup, testing, launch, support and updates | Deployment scripts and admin observability delivered; SLA/backup automation remains operations-managed. |

## 3. Final Architecture

### 3.1 Runtime Architecture

- Application Framework: Laravel 12 (PHP 8.2+ runtime in this repo baseline).
- Frontend Delivery: Inertia.js with React and Vite build artifacts.
- Database: SQLite for local development, MySQL/MariaDB supported for production.
- Queue/Jobs: Laravel queue listener used for async email and background operations.
- PDF Engine: barryvdh/laravel-dompdf for certificate generation.

### 3.2 Logical Components

- Public Experience:
  - Landing, legal pages, course catalog, public course preview.
- Learner Experience:
  - registration, email verification, profile completion, enrollment, learning player, quiz attempts, certificate retrieval.
- Admin Experience:
  - dashboard, course/section/lesson management, user management, analytics, activity logs, system logs, platform settings.
- Security Services:
  - captcha enforcement, role authorization, 2FA email OTP, verification throttling/rate limiting.

### 3.3 Route and Access Design

- Public routes: open browsing and legal content.
- Authenticated learner routes: protected by auth + verified + profile completion middleware.
- Admin routes: protected by auth + verified + admin middleware + scoped permissions for course_viewer role.

## 4. Application Stack (Final Baseline)

### 4.1 Backend

- PHP: ^8.2 (project requirement baseline).
- Laravel Framework: ^12.0.
- Inertia Laravel bridge: ^2.0.
- Activity logging: spatie/laravel-activitylog.
- Certificate PDF: barryvdh/laravel-dompdf.

### 4.2 Frontend

- React: 18.x in package baseline.
- Build tool: Vite 7.x.
- Styling: Tailwind CSS.
- UI support: Radix UI components, Mantine + BlockNote editor integrations.

### 4.3 Data Stores

- Development default: SQLite.
- Production target: MySQL/MariaDB through Laravel database drivers.
- Session storage default: database driver.

## 5. Data Design

### 5.1 Core Entities

- User: identity, role, profile demographics, suspension state, 2FA code state.
- Course: metadata, status, difficulty, certificate template.
- Section: ordered curriculum grouping under course.
- Lesson: typed learning objects (video, text, quiz, pdf), prerequisites, ordering.
- Enrollment: user-course relationship, completion state, certificate UUID.
- LessonProgress: per-lesson completion by learner.
- QuizAttempt: attempt history, answer payload, scoring outcome.
- Setting: configurable platform/admin settings.

### 5.2 Relationship Design

- One User -> many Enrollments.
- One Course -> many Sections -> many Lessons.
- One Enrollment -> many LessonProgress rows.
- One Lesson -> many QuizAttempts.
- Course viewer access uses pivot mapping (course_user_access).

### 5.3 Data Privacy Position

- Delivered profile model includes fields beyond minimal student identity list.
- No IC, home address, or phone fields are used in delivered schema.
- Passwords are hashed; OTP codes are short-lived and cleared after verification.

## 6. Security Design

### 6.1 Identity and Access

- Email verification required for authenticated learner/admin routes.
- Role-based authorization with explicit admin role checks.
- Course viewer scope restriction middleware prevents write operations.
- Account suspension blocks login with user-facing reason message.

### 6.2 Multi-Factor Authentication

- Email OTP (6-digit code) is generated per login.
- OTP validity: 10 minutes.
- Verification and resend endpoints protected with throttling and cooldown.
- MFA can be environment-toggled via auth configuration.

### 6.3 Application Security Controls

- CSRF protection via Laravel middleware stack.
- Input validation at controller/request layer for major workflows.
- SQL injection mitigation through Eloquent/query builder usage.
- Session/cookie hardening via HTTP-only and SameSite controls.

### 6.4 Audit and Logging

- Admin activity logs with export and retention policy controls.
- Risk classification and redaction options for sensitive log keys.
- System logging available through admin system logs interface.

## 7. Functional Design Highlights

### 7.1 Learning Flow

- Enrollment required for protected learning content.
- Resume logic redirects learner to last active lesson.
- Prerequisite lesson locking enforced before access/complete/quiz submission.
- Quiz grading is auto-calculated with pass/fail tracking and attempt history.
- Course completion can trigger certificate UUID and completion notification.

### 7.2 Certificate Design

- Certificate template is course-configurable.
- Dynamic certificate fields include learner name, course title, completion date, and certificate identifier.
- Public verification and PDF download endpoints use UUID access key.

### 7.3 Analytics and Reporting

- Course analytics include enrollment/completion/progress/quiz aggregates.
- Filter support includes date and demographic dimensions.
- CSV export delivered for analytics and admin activity logs.

## 8. Deployment Design

### 8.1 Deployment Process

Delivered scripts support:

- code update (git pull),
- dependency install (Composer, npm),
- frontend build (Vite),
- migration and optimization commands,
- storage link and runtime directory preparation.

### 8.2 Environment Requirements

- PHP runtime compatible with Laravel baseline.
- MySQL/MariaDB production database.
- SMTP/mail transport for verification, 2FA, and notification email.
- SSL enabled at web tier.

### 8.3 Hosting and Domain

- Application is deployable behind Apache or Nginx on target domain.
- Public assets served from built artifacts in public/build.

## 9. Performance and Scalability Design

### 9.1 Implemented Foundations

- Query composition using Eloquent and selective eager loading.
- Pagination for admin listings.
- Optimized build assets via Vite.
- Laravel optimize and cache clear/build workflow in deployment.

### 9.2 Required Operational Validation

The following must be completed in infra/UAT performance stream for final SLA acceptance:

- concurrent user load benchmark execution,
- response time and resource utilization profiling,
- uptime and reliability measurement,
- stress test evidence and scaling thresholds.

## 10. Operations and Maintenance Design

### 10.1 Maintenance Scope (Delivered App Layer)

- user/content administration interfaces,
- settings and email template management,
- activity/system log monitoring and export,
- deploy script for repeatable release steps.

### 10.2 External Operations Responsibilities

- scheduled backups and restore drills,
- platform patching cadence and incident SLA,
- infrastructure monitoring and alerting,
- disaster recovery runbook execution.

## 11. Open Technical Gaps and Design Decisions

The following requirements are not fully closed in current baseline and should be tracked as change requests or operational deliverables:

- bulk learner import,
- mass mail notifications to all users,
- automated reminder campaigns for incomplete learning,
- PDF-format reporting for analytics,
- explicit short-answer assessment workflow,
- enforced global certification threshold at 40% (if contractual requirement remains strict),
- automated backup scheduler integrated with production operations.

## 12. UAT and Release Readiness Criteria

Minimum readiness criteria:

- all core user journeys pass functional UAT,
- security UAT confirms auth, role restrictions, and OTP controls,
- production deployment rehearsal completed,
- database migration and rollback strategy verified,
- performance and availability evidence signed off by operations.

## 13. Final Technical Sign-Off Statement

This document is the final technical and design baseline for project delivery. It is valid for handover with the noted open items classified as enhancement or operations workstreams requiring explicit acceptance by project stakeholders.

## 14. Estimated Hosting Specification (AWS or Azure) with Autoscaling

### 14.1 Sizing Assumptions Used

- Workload is a Laravel + Inertia + React LMS with mixed read/write traffic.
- Session store and cache are externalized (Redis), not local filesystem.
- Static assets and media are offloaded to object storage + CDN.
- Database is managed MySQL with read scaling options.
- Concurrency target means simultaneous active users, not only logged-in accounts.
- Final capacity must be confirmed by load tests before production sign-off.

### 14.2 Recommended AWS Reference Architecture (Autoscaling)

1. Edge and routing
- Amazon CloudFront + AWS WAF + Application Load Balancer.

2. Application tier
- ECS Fargate service or EC2 Auto Scaling Group for PHP app containers.
- Separate autoscaled worker service for queue and email jobs.

3. Data tier
- Amazon RDS MySQL (Multi-AZ).
- Amazon ElastiCache for Redis (session, cache, rate-limit data).
- Amazon S3 for uploads, certificates, and static/media artifacts.

4. Observability and operations
- CloudWatch metrics and alarms.
- Backup snapshots for RDS and S3 versioning/lifecycle.

### 14.3 Recommended Azure Reference Architecture (Autoscaling)

1. Edge and routing
- Azure Front Door (or Application Gateway) + WAF.

2. Application tier
- Azure App Service Plan (Linux) with Azure Autoscale rules.
- Separate autoscaled worker process or container app for queue jobs.

3. Data tier
- Azure Database for MySQL Flexible Server (zone-redundant where applicable).
- Azure Cache for Redis.
- Azure Blob Storage + CDN for static/media files.

4. Observability and operations
- Azure Monitor, Application Insights, and autoscale alerts.
- Automated backups and retention policies on managed data services.

### 14.4 Capacity Tiers for 500 to 5000 Concurrent Users

| Tier | Concurrent Users | App Tier (Starting Point) | DB Tier (Starting Point) | Redis Tier | Notes |
|---|---|---|---|---|---|
| T1 | 500 | 3 to 4 instances, each ~2 vCPU and 4 GB RAM | 4 vCPU, 16 GB RAM managed MySQL | 1 to 2 node small/medium | Suitable for early production with headroom |
| T2 | 1500 | 6 to 8 instances, each ~2 vCPU and 4 GB RAM | 8 vCPU, 32 GB RAM managed MySQL | 2 node medium | Enable read replica and aggressive query tuning |
| T3 | 3000 | 10 to 14 instances, each ~2 to 4 vCPU and 8 GB RAM | 12 to 16 vCPU, 48 to 64 GB RAM | 2 to 3 node medium/large | Add background worker autoscaling and queue isolation |
| T4 | 5000 | 16 to 24 instances, each ~4 vCPU and 8 GB RAM | 16 to 32 vCPU, 64 to 128 GB RAM | 3 node large | Requires validated load profile and DB read/write split strategy |

### 14.5 Autoscaling Policy Baseline

AWS policy baseline:

- Target tracking autoscaling on CPU and ALB request metrics.
- Scale out trigger guidance: CPU sustained above 60% to 70% for 5 to 10 minutes.
- Scale in trigger guidance: CPU below 35% to 40% for 15 to 20 minutes.
- Maintain minimum healthy instance floor to absorb traffic spikes.

Azure policy baseline:

- Azure Autoscale on App Service plan using CpuPercentage and request/queue indicators.
- Scale out trigger guidance: average CPU above 65% to 70% for 10 minutes.
- Scale in trigger guidance: average CPU below 35% to 40% for 15 to 20 minutes.
- Set min/default/max instances to avoid cold-start bottlenecks.

Note: autoscale thresholds above follow current AWS/Azure guidance patterns and should be tuned from live telemetry after performance testing.

### 14.6 Monthly Cost Envelope (Infrastructure Only, Rough Order)

| Target | AWS Estimated Monthly Range | Azure Estimated Monthly Range | Cost Drivers |
|---|---|---|---|
| ~500 concurrent | USD 1,200 to 2,500 | USD 1,300 to 2,700 | App instances, managed DB, Redis, data transfer |
| ~1500 concurrent | USD 2,800 to 5,500 | USD 3,000 to 5,800 | Scale-out app tier and larger DB |
| ~3000 concurrent | USD 4,800 to 9,500 | USD 5,200 to 10,000 | Higher compute floor, replicas, cache scale |
| ~5000 concurrent | USD 7,000 to 15,000+ | USD 7,500 to 16,000+ | Database tier, bandwidth/CDN, HA overhead |

Cost caveats:

- Video-heavy e-learning traffic can make CDN egress the largest bill component.
- Regional pricing, reserved capacity, and support plans can materially change totals.
- Final cost model should be based on load-test RPS, payload size, and peak-hours profile.

### 14.7 Minimum Production Specification Recommendation

For first production go-live targeting 500 concurrent users with growth to 5000:

1. Start with T1 as baseline, but deploy architecture that can scale to T4 without redesign.
2. Enable autoscaling from day one with validated min/max boundaries.
3. Use managed MySQL + Redis + object storage/CDN, not local disk dependencies.
4. Complete staged load testing at 500, 1500, 3000, and 5000 concurrent users.
5. Re-baseline autoscaling rules after two weeks of real traffic telemetry.

