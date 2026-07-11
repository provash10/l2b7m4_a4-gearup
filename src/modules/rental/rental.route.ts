import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// customer
router.post("/", auth(Role.CUSTOMER), rentalController.createRental);
router.get("/", auth(Role.CUSTOMER), rentalController.getCustomerRentals);
router.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), rentalController.getRentalById);

export const rentalRoutes = router;

// provider
const providerRouter = Router();
providerRouter.get("/", auth(Role.PROVIDER), rentalController.getProviderOrders);
providerRouter.patch("/:id", auth(Role.PROVIDER), rentalController.updateOrderStatus);

export const providerOrderRoutes = providerRouter;

// admin
const adminRouter = Router();
adminRouter.get("/", auth(Role.ADMIN), rentalController.adminGetAllRentals);

export const adminRentalRoutes = adminRouter;
