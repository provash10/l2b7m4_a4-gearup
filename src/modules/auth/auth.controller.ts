import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../errors/AppError";

// const registerUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//   // console.log(payload);
//  const result = await authService.registerUserIntoDB(payload)

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "User Registered Successfully",
//     data: result,
//   });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         success : false,
//         statusCode : httpStatus.INTERNAL_SERVER_ERROR,
//         message: "Faild To Register User",
//         error:(error as Error).message

//     })
//   }
// }

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: result,
    });
  }
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    // const loginResult = await authService.loginUserFromDB(payload);
    const { accessToken, refreshToken } = await authService.loginUserFromDB(
      payload
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged In Successfully",
      // data:loginResult
      data: { accessToken, refreshToken },
    });
  }
);

// const getMe = catchAsync(async(req:Request, res: Response, next:NextFunction)=>{
//   // const cookies = req.cookies;
//   // console.log(cookies);
//   const {accessToken} = req.cookies;
//   console.log(accessToken);

//   const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)
//   console.log(verifiedToken)

//   res.send("Get Me")
// })

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Please login first");
    }

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret
    ) as { id?: string };

    const userId = verifiedToken.id;

    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }

    const result = await authService.getMeFromDB(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: result,
    });
  }
);

export const userController = {
  registerUser,
  loginUser,
  getMe,
};
