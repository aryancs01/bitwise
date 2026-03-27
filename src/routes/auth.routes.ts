import { Router } from "express";
import { register, signin } from "../controllers/auth.controller";
import { validate } from "../middleware/validateMiddleware";
import { userSignin, userRegister } from "../validators/user.validate";

export const authRouter = Router()

authRouter.post("/register", validate(userRegister), register)
authRouter.post("/signin", validate(userSignin), signin)