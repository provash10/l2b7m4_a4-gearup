import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);
router.post("/confirm", auth(Role.CUSTOMER, Role.ADMIN), paymentController.confirmPayment);
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getUserPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);


export const paymentRoutes = router;