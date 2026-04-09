# Bugs and Critical Issues Audit

Date: 2026-04-09
Scope: Full backend scan across controllers, routes, workers, queue pipeline, models, validators, and container execution path.

## Critical Issues

1. Command injection risk in code execution commands
- Severity: Critical
- Impact: Untrusted code and input are interpolated into shell command strings using single quotes. Malicious payloads can break quoting and execute unintended shell commands inside container process context.
- Where: src/containers/commands.ts
- Why it matters: This is the highest-priority security issue in an online judge.

2. Contest join is allowed at any time
- Severity: Critical
- Impact: Users can join after contest ends or outside intended window.
- Where: src/controllers/contest.controller.ts (attemptContest)
- Why it matters: Contest integrity is broken.

3. No contest-time validation before accepting contest submissions
- Severity: Critical
- Impact: Contest submission endpoint does not validate start/end window or contest status before queueing jobs.
- Where: src/controllers/contest.controller.ts (contestProblemSubmissions)
- Why it matters: Late submissions can still be judged and affect leaderboard.

4. Leaderboard data broadcasted to all websocket clients
- Severity: Critical
- Impact: All connected clients receive full leaderboard updates with no authentication/contest scoping.
- Where: src/utils/redisUtils.ts and src/config/socket.ts
- Why it matters: Privacy leak and unfair live visibility during contests.

## High Priority Bugs

1. Resubmission can downgrade solved problem status
- Severity: High
- Impact: A user who already solved a contest problem can become wrong_answer after a later wrong submission, because only one mutable status is stored per problem.
- Where: src/workers/contest.worker.ts (updateContestSubmission)
- Why it matters: Ranking and solved-count become unstable and unfair.

2. Score formula is too weak for competitive fairness
- Severity: High
- Impact: Current score formula uses solvedCount and elapsedTime only, with no wrong-attempt penalty and no freeze logic.
- Where: src/utils/redisUtils.ts and src/workers/contest.worker.ts
- Why it matters: Easy to game strategy, does not reflect standard contest scoring behavior.

3. Queue retries are not idempotent
- Severity: High
- Impact: Jobs are configured with retry attempts, but workers do not guard against duplicate processing side effects.
- Where: src/queues/submission.queue.ts, src/queues/contest.queue.ts, src/workers/evaluation.worker.ts, src/workers/contest.worker.ts
- Why it matters: Repeated state writes can corrupt final status and ranking.

4. JWT tokens never expire
- Severity: High
- Impact: Tokens remain valid indefinitely unless secret changes.
- Where: src/utils/jwtToken.ts
- Why it matters: Session hijack window is unbounded.

5. Password hashing rounds are low
- Severity: High
- Impact: bcrypt cost factor is 5, which is weaker than modern baseline.
- Where: src/utils/bcrypt.ts
- Why it matters: Easier brute-force cracking of leaked hashes.

## Medium Priority Bugs and Risks

1. No automatic contest state transition workflow
- Severity: Medium
- Impact: There is no scheduler/cron style worker to move contests from upcoming to ongoing to ended automatically.
- Where: Project-wide behavior gap (no scheduler module found)
- Why it matters: Manual status control causes timing drift and fairness issues.

2. Contest status enum mismatch between model and validator
- Severity: Medium
- Impact: Validator allows completed but model uses ended; model supports canceled and draft while validator does not.
- Where: src/validators/contest.validator.ts and src/models/contest.modal.ts
- Why it matters: Inconsistent API behavior and validation failures.

3. Submission language validation is too broad at API layer
- Severity: Medium
- Impact: Request validator accepts any non-empty language string; unsupported values fail later in worker/runtime path.
- Where: src/validators/submission.validator.ts
- Why it matters: Avoidable runtime errors and noisy queue failures.

4. Missing submission/code size limits
- Severity: Medium
- Impact: No max length guard on submitted code.
- Where: src/validators/submission.validator.ts
- Why it matters: Potential memory pressure and abuse.

5. Missing testcase count and testcase payload limits
- Severity: Medium
- Impact: Very large testcase sets can degrade worker performance or cause abuse.
- Where: src/validators/problem.validators.ts and src/models/problem.model.ts
- Why it matters: Potential denial-of-service vector.

6. No rate-limiting on auth and submission routes
- Severity: Medium
- Impact: Endpoints are vulnerable to brute-force and API spam.
- Where: src/app.ts and route modules
- Why it matters: Security and reliability risk.

7. Environment variables not strictly validated at startup
- Severity: Medium
- Impact: Required config values are type-cast and assumed present.
- Where: src/config/env.ts
- Why it matters: Startup/runtime instability and hard-to-debug failures.

## Low Priority Items

1. Unused or unreachable controller functions for submission CRUD extras
- Severity: Low
- Impact: Some submission controller exports are not routed.
- Where: src/controllers/submission.controller.ts and src/routes/submission.routes.ts

2. Dead commented testing code in server bootstrap
- Severity: Low
- Impact: Increases maintenance noise.
- Where: src/server.ts

## Suggested Fix Order

1. Fix command injection in execution command path.
2. Enforce contest join/submit windows and contest status checks.
3. Lock solved state behavior for contest resubmission.
4. Harden leaderboard access and broadcast policy.
5. Add score model upgrade (penalty + freeze).
6. Add idempotency guards in workers.
7. Add auth hardening (JWT expiry, stronger bcrypt).
8. Add rate limits and payload size limits.
9. Add scheduler for automatic contest transitions.
