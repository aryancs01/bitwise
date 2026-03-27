import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        sendResponse(res, 403, false, "Access denied. Admin privileges required.");
    }
};