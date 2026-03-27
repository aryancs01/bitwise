import { Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { User } from "../models/user.model";

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const user = await User.findById(userId).select("username email")

    if(!user){
        return sendResponse(res, 404, false, "User not found")
    }

    return sendResponse(res, 200, true, "User fetched successfully", user)

  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};
