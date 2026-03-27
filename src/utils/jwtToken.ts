import jwt from "jsonwebtoken"
import { env } from "../config/env";

export const createToken = (payload: {
    id: string;
    email: string;
    role: string;
}) => {
    return jwt.sign(payload, env.JWT_SECRET)
}

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, env.JWT_SECRET)
    } catch (error) {
        return null
    }
}