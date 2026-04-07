import mongoose from "mongoose";

export enum SubmissionStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  COMPILING = "compiling",
  RUNNING = "running",
  ACCEPTED = "accepted",
  WRONG_ANSWER = "wrong_answer",
}

export interface SubmissionData {
  problemId: string;
  status: SubmissionStatus;
}

export interface IContestParticipant {
  contestId: string;
  userId: string;
  submissions: SubmissionData[];
  createdAt: Date;
  updatedAt: Date;
}

const contestParticipantSchema = new mongoose.Schema<IContestParticipant>(
  {
    contestId: {
      type: String,
      ref: "Contest",
      required: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    submissions: [
      {
        problemId: { type: String, ref: "Problem" },
        status: {
          type: String,
          enum: Object.values(SubmissionStatus),
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, record: Record<string, any>) => {
        delete (record as any).__v;
        record.id = record._id;
        delete record._id;
        return record;
      }
    }
  }
);

export const ContestParticipant = mongoose.model<IContestParticipant>(
  "ContestParticipant",
  contestParticipantSchema,
);