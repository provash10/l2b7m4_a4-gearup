import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  }
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { activeStatus } = req.body;
    const result = await userService.updateUserStatus(id as string, activeStatus);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  }
);


 //Update the profile details 
 
const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { name, profilePhoto } = req.body;

    // update
    const result = await userService.updateMyProfile(userId as string, {
      name,
      profilePhoto,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile updated successfully",
      data: result,
    });
  }
);

export const userController = {
  getAllUsers,
  updateUserStatus,
  updateMyProfile,
};