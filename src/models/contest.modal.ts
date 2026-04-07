import mongoose, { Schema } from "mongoose";

export enum ContestStatus {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  ENDED = "ended",
  CANCELED = "canceled",
  DRAFT = "draft",
}

export interface IProblemInContest {
  problemId: mongoose.Types.ObjectId;
  order: number;
}

export interface IContest {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ContestStatus;
  problems: IProblemInContest[];
  createdAt: Date;
  updatedAt: Date;
}

const problemInContestSchema = new Schema<IProblemInContest>({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const contestSchema = new Schema<IContest>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"]
    },
    status: {
      type: String,
      enum: Object.values(ContestStatus),
      default: ContestStatus.DRAFT
    },
    problems: [problemInContestSchema]
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

export const Contest = mongoose.model<IContest>("Contest", contestSchema);