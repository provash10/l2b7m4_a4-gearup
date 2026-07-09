import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

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
)

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
  const payload = req.body;

  // const loginResult = await authService.loginUserFromDB(payload);
  const {accessToken,refreshToken} = await authService.loginUserFromDB(payload);

  res.cookie("accessToken", accessToken,{
    httpOnly : true,
    secure : false,
    sameSite : "none",
    maxAge : 1000 * 60 * 60 * 24   // 24 hours
  })

  res.cookie("refreshToken", refreshToken,{
    httpOnly : true,
    secure : false,
    sameSite : "none",
    maxAge : 1000 * 60 * 60 * 24 * 7   // 7 days
  })

  sendResponse(res,{
    success: true,
    statusCode : httpStatus.OK,
    message: "User Logged In Successfully",
    // data:loginResult
    data:{accessToken,refreshToken}
  })
})

const getMe = catchAsync(async(req:Request, res: Response, next:NextFunction)=>{

})

export const userController ={
    registerUser,
    loginUser,
    getMe
}