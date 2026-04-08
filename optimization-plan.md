Phase 1: Security Blockers (Do First)
Status: Completed

Harden 2FA endpoints [x]
Scope: add throttling and lockout controls for verify/resend flows.
Files: auth.php, TwoFactorVerificationController.php
Done when:
2FA verify has strict per-user+IP limits.

Resend has cooldown and max retries.

Abuse attempts return safe generic errors.

Protect admin login from bots [x]

Scope: enforce captcha or equivalent anti-automation on admin login.
Files: AdminSessionController.php
Done when:
Admin login requires configured captcha.

Failure states are localized and user-safe.

Bot attempts are visible in logs.

Add security response headers [x]

Scope: add CSP baseline, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS (on HTTPS).
Files: app.php, middleware folder Middleware
Done when:
Headers appear on public and auth pages.

No breakage on Inertia/Vite assets.

CSP can run in report mode first, then enforce.

Remove public version disclosure [x]

Scope: stop sending Laravel/PHP versions to landing props.
Files: web.php
Done when:
Landing still renders normally.
Version values are removed from response payload.


Phase 2: Reliability and Ops Safety
Status: In progress

[Deferred for now]
5. Gate deploy on CI pass

Scope: prevent production deploy unless tests/build pass.
Files: /.github/workflows/ci.yml, /.github/workflows/deploy.yml
Done when:
Deploy workflow depends on successful CI.

Failed test/build blocks deploy automatically.
[/deferred]

Move sync mail sends to queue [x]

Scope: queue 2FA/invitation emails and supervise workers.
Files: TwoFactorAuthenticator.php, InvitationsController.php, queue.php
Done when:
Auth flow does not block on SMTP latency.

Queue retry/failure behavior is defined.

Failed jobs are observable and recoverable.

Improve config failure observability [x]

Scope: replace silent catches with structured warning logs.
Files: AppServiceProvider.php
Done when:
Misconfigured SMTP/settings are logged clearly.
App still boots safely.


Phase 3: Performance and Scale Readiness
8. Switch production runtime to Redis-backed state

Scope: use Redis for cache/session/queue in production env.
Files: cache.php, session.php, queue.php, .env.example
Done when:
Production env uses Redis for these three concerns.

Login/session and queued jobs are stable.

Rollback toggles are documented.

Refactor heavy analytics/course controllers

Scope: extract service classes and cache expensive aggregates.
Files: AnalyticsController.php, CoursesController.php
Done when:
Controller methods become orchestration-only.

Heavy calculations moved to services.

Key queries/metrics cached with invalidation rules.

Address dependency advisory

Scope: patch or constrain vulnerable package path.
Source: composer audit finding on league/commonmark.
Done when:
composer audit returns clean for production dependencies.
Regression checks pass.
Phase 4: QA and Go-Live Evidence
11. Stabilize local/CI test parity

Scope: ensure sqlite driver availability and reproducible feature test runs.
Files: /.github/workflows/ci.yml, local setup docs README.md
Done when:
Team can run feature tests locally without driver failures.

CI and local test outcomes are consistent.

Complete UAT sign-off sheet

Scope: execute and fill required UAT matrix.
File: UAT-activities.md
Done when:
Required cases are marked with results/evidence.
Critical/High defects are closed or formally accepted.
Launch sign-off is documented.