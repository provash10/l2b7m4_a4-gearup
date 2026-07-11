import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/users/user.route";
import {
  gearRoutes,
  providerGearRoutes,
  adminGearRoutes,
} from "./modules/gearItem/gearItem.route";
import { categoryRoutes } from "./modules/category/category.route";
import {
  rentalRoutes,
  providerOrderRoutes,
  adminRentalRoutes,
} from "./modules/rental/rental.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { paymentRoutes } from "./modules/payment/payment.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("GearUp is active !!!");
});

// app.post();
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/provider/gear", providerGearRoutes);
app.use("/api/admin/gear", adminGearRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/provider/orders", providerOrderRoutes);
app.use("/api/admin/rentals", adminRentalRoutes);
app.use("/api/payments", paymentRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
