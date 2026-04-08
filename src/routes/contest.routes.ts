import { Router } from "express";
import { attemptContest, contestProblemSubmissions, createContest, getContestById, getContests, updateContest } from "../controllers/contest.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { createSubmissionSchema } from "../validators/submission.validator";
import { validate } from "../middleware/validateMiddleware";
import { createContestSchema } from "../validators/contest.validator";

export const contestRouter = Router()

contestRouter.route("/")
    .get(getContests)
    .post(authMiddleware, adminMiddleware, validate(createContestSchema), createContest) 

contestRouter.route("/:id")
    .get(getContestById)
    .put(authMiddleware, adminMiddleware,updateContest) 

contestRouter.post("/:id/attempt", authMiddleware, attemptContest)

contestRouter.post("/:id/submit", authMiddleware, validate(createSubmissionSchema), contestProblemSubmissions)
