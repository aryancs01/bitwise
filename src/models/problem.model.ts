import mongoose, { Schema } from "mongoose";

export interface ITestCase {
  input: string;
  output: string;
}

export interface IProblem {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
  editorial?: string;
  testcases: ITestCase[];
}

const testSchema = new Schema<ITestCase>(
  {
    input: {
      type: String,
      required: [true, "Input is required"],
      trim: true,
    },
    output: {
      type: String,
      required: [true, "Output is required"],
      trim: true,
    },
  },
  {
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

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxLength: [100, "Title must be less than 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be either easy, medium or hard",
      },
      default: "easy",
      required: [true, "Difficulty is required"],
    },
    editorial: {
      type: String,
      trim: true,
    },
    testcases: [testSchema],
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

problemSchema.index({ title: 1 }, { unique: true });
problemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);
