import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { problemRouter } from "./problem.routes";
import { submissionRouter } from "./submission.routes";

export const router = Router()

router.use("/auth", authRouter)
router.use("/user", userRouter)
router.use("/problem", problemRouter)
router.use("/submission", submissionRouter)