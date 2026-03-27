import mongoose, { Schema, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;

  name?: string;
  avatar?: string;
  bio?: string;

  role: "user" | "admin";
  isVerified: boolean;

  submissionsCount: number;
  lastSubmissionDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      type: String,
    },

    avatar: {
      type: String,
    },

    bio: {
      type: String,
      maxlength: 300,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    submissionsCount: {
      type: Number,
      default: 0,
    },

    lastSubmissionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema)