import { Router } from "express";
import { createProblem, getProblemById, getAllProblems, updateProblem } from "../controllers/problem.controller";  
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { createProblemValidate, updateProblemValidate } from "../validators/problem.validators";

export const problemRouter = Router();

problemRouter.route("/")
    .post(authMiddleware, adminMiddleware, validate(createProblemValidate), createProblem)
    .get(getAllProblems);

problemRouter.route("/:id")
    .get(getProblemById)
    .put(authMiddleware, adminMiddleware, validate(updateProblemValidate), updateProblem);