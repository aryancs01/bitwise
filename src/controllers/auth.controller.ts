import { Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { User } from "../models/user.model";
import { comparePassword, hashedPassword } from "../utils/bcrypt";
import { createToken } from "../utils/jwtToken";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({
      email: email,
    });

    if (user) {
      return sendResponse(res, 400, false, "User already exist");
    }

    const username_unique = await User.findOne({
      username: username,
    });

    if (username_unique) {
      return sendResponse(res, 400, false, "username already present");
    }

    const hashPassword = await hashedPassword(password);
    const createUser = await User.create({
      username,
      email,
      password: hashPassword,
    });

    if (!createUser) {
      return sendResponse(res, 400, false, "user not created");
    }

    const token = await createToken({
      id: createUser._id.toString(),
      email: createUser.email,
      role: createUser.role,
    });

    return sendResponse(res, 201, true, "User register successfully", {
      token,
    });
  } catch (error: any) {
    console.log(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne(
      { email },
      {
        password: true,
        email: true,
        role: true
      },
    );

    if (!user) {
      return sendResponse(res, 400, false, "Invalid credentials");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return sendResponse(res, 400, false, "Invalid credentials");
    }

    const token = await createToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return sendResponse(res, 200, true, "User signin successfully", {
      token,
    });
  } catch (error: any) {
    console.log(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};
