import mongoose, { Document } from "mongoose";

export enum SubmissionStatus {
  PENDING = "pending",
  COMPILING = "compiling",
  RUNNING = "running",
  ACCEPTED = "accepted",
  WRONG_ANSWER = "wrong_answer",
}

export enum SubmissionLanguage {
  CPP = "cpp",
  PYTHON = "python",
}

export interface ISubmission extends Document {
  problemId: String;
  code: String;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: String;
  jobId?: String | null;
}

const submissionSchema = new mongoose.Schema<ISubmission>(
  {
    problemId: {
      type: String,
      ref: "Problem",
      required: [true, "Problem ID is required"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    language: {
      type: String,
      enum: Object.values(SubmissionLanguage),
      required: [true, "Language is required"],
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      required: [true, "Status is required"],
      default: SubmissionStatus.PENDING,
    },
    userId: {
      type: String,
      ref: "User",
      required: [true, "User ID is required"],
    },
    jobId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, record: Record<string, any>) => {
        delete (record as any).__v;
        record.id = record._id;
        delete record._id;
        return record;
      },
    },
  },
);

submissionSchema.index({ status: 1 });

export const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema,
);
