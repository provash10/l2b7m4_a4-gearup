import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import httpStatus from "http-status";

import jwt, { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../errors/AppError";

const registerUserIntoDB = async (payload: IRegisterUser) => {
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
};

const loginUserFromDB = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support"
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  // const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret,
  //   {
  //   expiresIn : config.jwt_access_expires_in
  //   } as SignOptions
  // )

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  );

  // const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret,
  //   {
  //   expiresIn : config.jwt_refresh_expires_in
  //   } as SignOptions
  //  )

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  );

  //vercel ms package

  // return user;
  return {
    accessToken,
    refreshToken,
  };
};

// const getMeFromDB = async (userId: string) => {
//   if (!userId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "User ID is missing");
//   }

//   const user = await prisma.user.findUniqueOrThrow({
//     where: { id: userId },
//     omit: {
//       password: true,
//     },
//   });
//   return user;
// };


const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
  });
  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUserFromDB,
  getMeFromDB,
};
