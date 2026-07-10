import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import httpStatus from "http-status";
import { AppError } from "../errors/AppError";

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
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization?.split(" ")[1]
      : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource"
      );
    }

    let verifiedToken;
    try {
      verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token. Please log in again.");
    }

    if (!verifiedToken || typeof verifiedToken === "string") {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token. Please log in again.");
    }

    const { email, name, id, role } = verifiedToken as JwtPayload;

    if (!email || !name || !id) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload. Please log in again.");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again");
    }

    const normalizedTokenRole =
      typeof role === "string" ? role.toUpperCase() : "";
    const effectiveRole = (user.role || normalizedTokenRole || "") as Role;
    const normalizedEffectiveRole = effectiveRole.toUpperCase();
    const normalizedRequiredRoles = requiredRoles.map((requiredRole) =>
      requiredRole.toUpperCase()
    );

    if (
      requiredRoles.length &&
      !normalizedRequiredRoles.includes(normalizedEffectiveRole)
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource"
      );
    }

    if (user.activeStatus === "BLOCKED") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked.Please contact support");
    }

    req.user = {
      email,
      name,
      id,
      role: effectiveRole,
    };

    next();
  });
};
