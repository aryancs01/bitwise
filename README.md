# Bitwise

Bitwise is a backend coding platform for practice and contest-style programming. It supports user auth, problem management, async judging in Docker containers, contest participation, and live leaderboard updates over WebSocket.

## Current Capabilities

### Authentication and Users
- Register and sign in with JWT token flow
- Password hashing with bcrypt
- User profile endpoint for authenticated users
- Role-based authorization (user and admin)

### Problem Management
- Admin-only create and update problem APIs
- Problem listing with search, pagination, and difficulty filter
- Markdown sanitization for description and editorial before persistence
- Testcase-based problem definitions

### Submissions and Judge Pipeline
- Authenticated users can submit code for normal problem solving
- Supported languages: Python and C++
- BullMQ queues for asynchronous submission processing
- Dockerized execution per testcase with timeout, memory, CPU, and no-network limits
- Verdict aggregation with testcase outputs

### Contest System
- Contest CRUD-style lifecycle endpoints (admin-managed)
- Contest attempt endpoint to register participants
- Contest-specific problem submission endpoint
- Contest worker pipeline for async judging
- Redis sorted-set based leaderboard score updates
- WebSocket broadcast for leaderboard updates

## Scoring Logic (Current)

Current leaderboard score formula is:

score = solvedCount * 1000000000 - elapsedTime

This is currently optimized for solved-first ranking with time as tie-breaker. Penalty-based scoring, freeze windows, and anti-cheat scoring safeguards are planned next.

## Project Structure

Core runtime paths are organized as:

- src/controllers for API handlers
- src/routes for route wiring
- src/models for MongoDB schemas
- src/validators for request payload checks
- src/queues, src/producers, src/workers for async judging workflows
- src/containers for Docker command and runtime setup
- src/config and src/utils for environment, Redis, websocket, and helpers

## Tech Stack

- TypeScript, Node.js, Express
- MongoDB with Mongoose
- Redis with BullMQ
- Docker with Dockerode
- Zod request validation
- JWT and bcrypt for auth security
- ws for realtime messaging

## Known Gaps and Next Work

The latest audit identified urgent items around:

- Contest fairness rules (join timing, contest window checks, resubmission behavior)
- Scoring model hardening and penalty-based ranking
- Execution security improvements for container command construction
- Leaderboard privacy controls during active contests
- Missing automatic contest status transitions (no scheduler/cron flow)

See these files for details:

- BUGS_AND_CRITICAL_ISSUES.md
- FEATURE_ROADMAP.md

## Run Locally

1. Install dependencies:

	npm install

2. Configure environment variables:

	- PORT
	- MONGO_URI
	- JWT_SECRET
	- REDIS_HOST
	- REDIS_PORT

3. Start development server:

	npm run dev

4. Build and run production mode:

	npm run build
	npm run start
