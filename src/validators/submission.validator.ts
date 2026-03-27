import z from "zod";

export const createSubmissionSchema = z.object({
    problemId: z.string().trim().min(1, "Problem ID is required"),
    code: z.string().trim().min(1, "Code is required"),
    language: z.string().trim().min(1, "Language is required"),
});