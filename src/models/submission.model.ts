import mongoose, { Document } from "mongoose";

export enum SubmissionStatus {
  PENDING = "pending",
  COMPILING = "compiling",
  RUNNING = "running",
  ACCEPTED = "accepted",
  WRONG_ANSWER = "wrong_answer",
}

export enum TestCaseStatus {
  AC = "AC",
  WA = "WA",
  TLE = "TLE",
  ERROR = "Error",
}

export enum SubmissionLanguage {
  CPP = "cpp",
  PYTHON = "python",
}

export interface SubmissionData {
  testcaseId: string;
  status: SubmissionStatus;
  output: string;
}

export interface ISubmission {
  problemId: String;
  code: String;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: String;
  jobId?: String | null;
  submission: SubmissionData[];
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
    submission: [
      {
        testcaseId: {
          type: String,
          required: [true, "Testcase ID is required"],
        },  
        status: {
          type: String,
          enum: Object.values(SubmissionStatus),
          required: [true, "Status is required"],
        },
        output: {
          type: String,
          required: [true, "Output is required"],
        }
      }
    ]
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
