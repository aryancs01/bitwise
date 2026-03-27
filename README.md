# Bitwise

## Short Description
Bitwise is a backend coding platform where users can solve programming problems and get their code judged automatically.
It supports problem management, user authentication, submission tracking, and async code evaluation in isolated Docker containers.

## Features
- User signup/signin with JWT-based authentication
- Problem CRUD with search, filters, pagination, and difficulty tags
- Markdown sanitization for safe problem statements and editorials
- Code submissions for multiple languages (currently C++ and Python)
- Async evaluation pipeline using queues and workers
- Per-testcase verdicts like AC, WA, TLE, and runtime error states
- Submission history and status tracking per user

## Tech Stack
- TypeScript + Node.js + Express
- MongoDB + Mongoose
- Redis + BullMQ
- Docker (isolated code execution)
- Zod (request validation)
- JWT + bcrypt (auth and password security)

## How It Works
A user logs in and submits code for a selected problem. The API stores the submission in MongoDB and pushes an evaluation job to Redis through BullMQ. A worker picks up the job, runs the code inside a language-specific Docker container against each testcase, compares output, and updates the submission status. The client can then fetch final verdicts and testcase-level results.

## Key Highlights
- Built a mini online judge architecture with async job processing
- Combined queue-based workers with containerized execution for safer runtime isolation
- Designed clean, modular backend layers (routes, controllers, models, workers)
- Balanced scalability (async processing) with clear API structure for future frontend integration
