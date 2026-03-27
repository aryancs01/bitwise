import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((error) => error.message);
        return sendResponse(res, 400, false, "Validation failed", messages)
      }
      return sendResponse(res, 400, false, "Validation failed")
    }
  };
