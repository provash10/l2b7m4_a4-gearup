import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { IRegisterUser } from "./auth.interface";

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

export const authService={
    registerUserIntoDB
}