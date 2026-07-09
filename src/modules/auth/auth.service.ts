import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import httpStatus from "http-status";
import { AppError } from "../../errors/appError";


const registerUserIntoDB = async(payload : IRegisterUser)=>{
     const { name, email, password, role, profilePhoto } = payload;
     
    const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with The email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      profilePhoto,
    },
    omit: {
      password: true,
    },
  });

  return createdUser;
}

const loginUserFromDB = async(payload : ILoginUser) =>{
  const {email, password} = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {email},
  });

  if(user.activeStatus=== "BLOCKED"){
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support"
    )
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }
}

export const authService={
    registerUserIntoDB,
    loginUserFromDB
}