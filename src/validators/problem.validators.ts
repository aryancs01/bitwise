import { z } from "zod";

const difficultySchema = z.enum(["easy", "medium", "hard"]);

const testCaseSchema = z.object({
	input: z
		.string()
		.trim()
		.min(1, "Input is required"),
	output: z
		.string()
		.trim()
		.min(1, "Output is required"),
});

export const createProblemValidate = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Title is required")
		.max(100, "Title must be less than 100 characters"),
	description: z
		.string()
		.trim()
		.min(1, "Description is required"),
	difficulty: difficultySchema.optional(),
	editorial: z
		.string()
		.trim()
		.optional(),
	testcases: z
		.array(testCaseSchema)
		.optional(),
});

export const updateProblemValidate = z
	.object({
		title: z
			.string()
			.trim()
			.min(1, "Title is required")
			.max(100, "Title must be less than 100 characters")
			.optional(),
		description: z
			.string()
			.trim()
			.min(1, "Description is required")
			.optional(),
		difficulty: difficultySchema.optional(),
		editorial: z
			.string()
			.trim()
			.optional(),
        testcases: z
            .array(testCaseSchema)
            .optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required to update problem",
	});
