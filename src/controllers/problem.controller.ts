import { Problem } from "../models/problem.model";
import { sendResponse } from "../utils/response"
import { Response, Request } from "express"
import { sanitizeMarkdown } from "../utils/markdown.sanitizer";

export const createProblem = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        const sanitizedPayload = {
            ...data,
            description: await sanitizeMarkdown(data.description),
            editorial: data.editorial ? await sanitizeMarkdown(data.editorial) : undefined,
        };

        const problem = await Problem.create({
            title: data.title,
            description: sanitizedPayload.description,
            difficulty: data.difficulty ? data.difficulty : "easy",
            editorial: sanitizedPayload.editorial,
            testcases: data.testcases ? data.testcases : undefined,
        });

        sendResponse(res, 201, true, "Problem created successfully", problem);
    } catch (error) {
        console.log(error)
        sendResponse(res, 500, false, "Internal Server Error")
    }
}

export const updateProblem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const problem = await Problem.findById(id);

        if (!problem) {
            return sendResponse(res, 404, false, "Problem not found");
        }

        const sanitizedPayload = {
            ...data,
            description: data.description ? await sanitizeMarkdown(data.description) : problem.description,
            editorial: data.editorial ? await sanitizeMarkdown(data.editorial) : problem.editorial,
        };

        const updatedProblem = await Problem.findByIdAndUpdate(id, sanitizedPayload, { new: true });

        sendResponse(res, 200, true, "Problem updated successfully", updatedProblem);
    } catch (error) {
        console.log(error)
        sendResponse(res, 500, false, "Internal Server Error")
    }
}

export const getProblemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const problem = await Problem.findById(id);

        if (!problem) {
            return sendResponse(res, 404, false, "Problem not found");
        }

        sendResponse(res, 200, true, "Problem retrieved successfully", problem);
    } catch (error) {
        console.log(error)
        sendResponse(res, 500, false, "Internal Server Error")
    }
}

export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined;
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const skip = (page - 1) * limit;

        const difficulty = req.query.difficulty as string | undefined;
        const filter: any = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const problems = await Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

        sendResponse(res, 200, true, "Problems retrieved successfully", problems);
    } catch (error) {
        console.log(error)
        sendResponse(res, 500, false, "Internal Server Error")
    }
}

export const deleteProblem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const problem = await Problem.findByIdAndDelete(id);

        if (!problem) {
            return sendResponse(res, 404, false, "Problem not found");
        }

        sendResponse(res, 200, true, "Problem deleted successfully", problem);
    } catch (error) {
        console.log(error)
        sendResponse(res, 500, false, "Internal Server Error")
    }
}

