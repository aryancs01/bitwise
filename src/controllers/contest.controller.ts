import { ContestParticipant } from "../models/contest-participants.modals";
import { Contest } from "../models/contest.modal";
import { Problem } from "../models/problem.model";
import { addContestJob } from "../producers/contest.producer";
import { addSubmissionJob } from "../producers/submission.producer";
import { sendResponse } from "../utils/response";
import { Request, Response } from "express";

export const createContest = async (req: Request, res: Response) => {
  try {
    const { name, description, startTime, endTime, problems, status } =
      req.body;

    const contest = await Contest.create({
      name,
      description,
      startTime,
      endTime,
      problems,
      status: status || "draft",
    });

    return sendResponse(
      res,
      201,
      true,
      "Contest created successfully",
      contest,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getContests = async (req: Request, res: Response) => {
  try {
    const contests = await Contest.find({
      status: { $ne: "draft" },
    }).populate("problems.problemId", "title");

    return sendResponse(
      res,
      200,
      true,
      "Contests retrieved successfully",
      contests,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getContestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id).populate(
      "problems.problemId",
      "title",
    );

    if (!contest) {
      return sendResponse(res, 404, false, "Contest not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "Contest retrieved successfully",
      contest,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const updateContest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, startTime, endTime, problems, status } =
      req.body;

    const contest = await Contest.findById(id);

    if (!contest) {
      return sendResponse(res, 404, false, "Contest not found");
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      { name, description, startTime, endTime, problems, status },
      { new: true },
    );

    return sendResponse(
      res,
      200,
      true,
      "Contest updated successfully",
      updatedContest,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const attemptContest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }
    if (!id) {
      return sendResponse(res, 400, false, "Contest ID is required");
    }

    const contest = await Contest.findById(id);

    if (!contest) {
      return sendResponse(res, 404, false, "Contest not found");
    }

    const participant = await ContestParticipant.create({
      contestId: id as string,
      userId,
      submissions: [
        ...contest.problems.map((p) => ({
          problemId: p.problemId.toString(),
          status: "not_submitted",
        })),
      ],
    });

    return sendResponse(
      res,
      200,
      true,
      "Contest retrieved successfully",
      participant,
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const contestProblemSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    if (!id) {
      return sendResponse(
        res,
        400,
        false,
        "Contest Participant ID is required",
      );
    }

    const contestParticipant = await ContestParticipant.findOne({
      _id: id,
      userId,
    });

    if (!contestParticipant) {
      return sendResponse(res, 404, false, "Contest Participant not found");
    }

    const contest = await Contest.findById(
      contestParticipant.contestId,
    ).populate("problems.problemId", "title");

    if (!contest) {
      return sendResponse(res, 404, false, "Contest not found");
    }

    if (
      !contest.problems.some((p) => p.problemId._id.toString() === problemId)
    ) {
      return sendResponse(res, 400, false, "Problem not part of the contest");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return sendResponse(res, 404, false, "Problem not found");
    }

    await addContestJob({
      contextParticipantId: contestParticipant._id.toString(),
      problemId,
      problem,
      code,
      language,
      userId: userId,
    });

    return sendResponse(res, 201, true, "Submission created successfully", {});
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};
