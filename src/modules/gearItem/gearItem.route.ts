import { Router } from "express";
import { gearController } from "./gearItem.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Public routes
router.get("/", gearController.getAllGear);
router.get("/:id", gearController.getGearById);

export const gearRoutes = router;

// Provider routes
const providerRouter = Router();
providerRouter.post("/", auth(Role.PROVIDER), gearController.createGear);
providerRouter.put("/:id", auth(Role.PROVIDER), gearController.updateGear);
providerRouter.delete("/:id", auth(Role.PROVIDER), gearController.deleteGear);

export const providerGearRoutes = providerRouter;

// Admin routes
const adminRouter = Router();
adminRouter.get("/", auth(Role.ADMIN), gearController.adminGetAllGear);

export const adminGearRoutes = adminRouter;
