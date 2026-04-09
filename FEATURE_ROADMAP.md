# Feature Roadmap

Date: 2026-04-09
Goal: Practical features for the current architecture (Express + MongoDB + Redis + BullMQ + Docker workers).

## Priority 1: Contest Integrity and Fairness

1. Penalty-based scoring model
- Add wrong-attempt penalty per problem (for example +20 minutes) and freeze final score logic.
- Keep configurable scoring modes: ICPC style and Codeforces style.

2. Contest join and submit guardrails
- Allow join only in configured window.
- Reject submissions outside contest start/end window.
- Auto-lock participant state at contest end.

3. Resubmission policy control
- Per contest option:
  - Best submission counts.
  - First AC locks problem.
  - Last submission counts.
- Default should prevent AC downgrade by later wrong answer.

4. Leaderboard freeze and delayed reveal
- Freeze leaderboard in last N minutes.
- Reveal hidden submissions after contest ends.

## Priority 2: Security and Anti-Cheat

1. Plagiarism detection engine
- Tokenize code and compute normalized fingerprint (winnowing or rolling hash).
- Compare intra-contest and cross-contest submissions.
- Store similarity score and suspicious segment spans.

2. Admin plagiarism review panel (API side first)
- Endpoint to fetch flagged submission pairs sorted by similarity.
- Include language-normalized snippets and metadata.

3. Suspicious behavior detection
- Track IP, user-agent, submission timing bursts, identical runtime signatures.
- Raise risk flags for manual review.

4. Secure websocket channels
- Authenticate websocket clients with JWT.
- Authorize contest-specific subscription.
- Separate public and private leaderboard views.

## Priority 3: Judge and Platform Reliability

1. Worker idempotency keys
- Use submissionId/participantId guard to ignore duplicate retry side effects.
- Ensure retries do not corrupt score or status.

2. Scheduler service (cron-like)
- Automatic contest status transitions based on time.
- Nightly cleanup for stale Redis leaderboard keys.

3. Rejudge system
- Re-run all submissions for a problem after testcase updates.
- Support selective rejudge by contest/problem/user.

4. Queue observability
- Add queue metrics: wait time, processing time, fail rate, retry count.
- Add per-language runtime and memory trend dashboard.

## Priority 4: Product and Growth Features

1. Public profile and progress analytics
- Difficulty-wise AC rate, streaks, topic heatmap, monthly activity.

2. Problem tagging and recommendation system
- Add topic tags and suggest next problems based on weakness profile.

3. Virtual contest mode
- Let users replay past contest with personal timer and private leaderboard.

4. Editorial unlock policy
- Unlock editorial after AC or after contest end.

5. Discussion thread per problem
- Add solution discussion, upvotes, and moderator controls.

## Suggested Milestones

1. Milestone A (Integrity first)
- Join/submit guards, AC downgrade fix, scoring penalty model, leaderboard freeze.

2. Milestone B (Security)
- Command path hardening, JWT expiry policy, rate limits, websocket auth.

3. Milestone C (Anti-cheat)
- Plagiarism fingerprinting, suspicious activity flags, admin review APIs.

4. Milestone D (Scale and UX)
- Scheduler, rejudge, observability, recommendations, virtual contests.
