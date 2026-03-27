import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { profile } from "../controllers/user.controller";

export const userRouter = Router()

userRouter
    .route("/profile")
    .get(authMiddleware, profile)