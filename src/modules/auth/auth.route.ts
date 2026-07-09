import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpStatus from "http-status";
import { userController } from "./auth.controller";


const router = Router();

router.post("/register",userController.registerUser)

export const authRoutes = router