import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Route - get all users (restricted to ADMIN)
router.get("/", auth(Role.ADMIN), userController.getAllUsers);


router.patch(
  "/update-profile",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  userController.updateMyProfile
);

// Route to update a user's active status by ID (restricted to ADMIN)
router.patch("/:id", auth(Role.ADMIN), userController.updateUserStatus);

export const userRoutes = router;
