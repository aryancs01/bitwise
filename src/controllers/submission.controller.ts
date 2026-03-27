import { Problem } from "../models/problem.model";
import { Submission, SubmissionStatus } from "../models/submission.model";
import { addSubmissionJob } from "../producers/submission.producer";
import { sendResponse } from "../utils/response";
import { Request, Response } from "express";

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return sendResponse(res, 404, false, "Problem not found");
    }

    const submission = await Submission.create({
      problemId,
      code,
      language,
      userId: userId,
    });

    const jobId = await addSubmissionJob({
        submissionId: submission._id.toString(),
        problem,
        code,
        language,
        userId: userId,
    })

    if(jobId) {
        submission.jobId = jobId;
        await submission.save();
    }

    return sendResponse(
      res,
      201,
      true,
      "Submission created successfully",
      submission,
    );
  } catch (error) {
    return sendResponse(res, 400, false, (error as Error).message);
  }
};

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    if (!id) {
      return sendResponse(res, 400, false, "Submission ID is required");
    }

    const submission = await Submission.findOne({
      _id: id,
      userId: userId,
    });

    if (!submission) {
      return sendResponse(res, 404, false, "Submission not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "Submission fetched successfully",
      submission,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { problemId } = req.query;

    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    if (!problemId) {
      return sendResponse(res, 400, false, "Problem ID is required");
    }

    const submissions = await Submission.find({ problemId, userId });
    return sendResponse(
      res,
      200,
      true,
      "Submissions fetched successfully",
      submissions,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return sendResponse(res, 401, false, "Unauthorized");
        }

        if (!id) {
            return sendResponse(res, 400, false, "Submission ID is required");
        }

        const submission = await Submission.findOneAndDelete({
            _id: id,
            userId: userId,
        });

        if (!submission) {
            return sendResponse(res, 404, false, "Submission not found");
        }

        return sendResponse(res, 200, true, "Submission deleted successfully", submission);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Internal server error", null);
    }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const userId = req.user?.id;
        const {status} = req.body;

        if (!userId) {
            return sendResponse(res, 401, false, "Unauthorized");
        }

        if (!id) {
            return sendResponse(res, 400, false, "Submission ID is required");
        }

        if(SubmissionStatus[status as keyof typeof SubmissionStatus] === undefined) {
            return sendResponse(res, 400, false, "Invalid submission status");
        }

        const submission = await Submission.findById(id);

        if (!submission) {
            return sendResponse(res, 404, false, "Submission not found");
        }

        submission.status = status as any;
        await submission.save();
        return sendResponse(res, 200, true, "Submission status updated successfully", submission);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Internal server error", null);
    }
}