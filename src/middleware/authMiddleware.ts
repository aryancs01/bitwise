import { Request, Response, NextFunction } from "express"
import { sendResponse } from "../utils/response"
import { verifyToken } from "../utils/jwtToken";
import { JwtPayload } from "jsonwebtoken";

export const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const headers = req.headers["authorization"]
        if(!headers || !headers.startsWith("Bearer ")){
            return sendResponse(res, 401, false, "Authorization token missing");
        }

        const token = headers.split("Bearer ")[1]
        if(!token){
            return sendResponse(res, 401, false, "Authorization token missing");
        }

        const payload = await verifyToken(token) as JwtPayload;

        if(!payload){
            return sendResponse(res, 401, false, "Invalid or expired token");
        }

        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        }
        next()
    } catch (error) {
        return sendResponse(res, 401, false, "Invalid or expired token");
    }
}