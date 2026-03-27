import { Router } from "express";
export const submissionRouter = Router();
import { createSubmission } from "../controllers/submission.controller";
import { createSubmissionSchema } from "../validators/submission.validator";
import { validate } from "../middleware/validateMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

submissionRouter.post("/", authMiddleware, validate(createSubmissionSchema), createSubmission);