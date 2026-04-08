import z from 'zod';

export const createContestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format for startTime",
    }),
    endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format for endTime",
    }),
    problems: z.array(z.object({
        problemId: z.string().min(1, "Problem ID is required"),
        order: z.number().default(0),
    })).optional(),
    status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
});