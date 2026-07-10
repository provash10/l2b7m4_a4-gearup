import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

//auth(Role.ADMIN, Role.USER, Role.Author)
//auth()=>...requiredRoles=>[Role.ADMIN, Role.USER, Role.Author]
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization?.split(" ")[1]
      : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this resource"
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    console.log(verifiedToken);
    
    if (!verifiedToken || typeof verifiedToken === "string") {
      throw new Error("Invalid token. Please log in again.");
    }

    const { email, name, id, role } = verifiedToken as JwtPayload;

    if (!email || !name || !id || !role) {
      throw new Error("Invalid token payload. Please log in again.");
    }

    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resource"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!user) {
      throw new Error("User not found. Please log in again");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked.Please contact support");
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};
