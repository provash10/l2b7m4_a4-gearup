import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/users/user.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

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

app.use(globalErrorHandler);
app.use(notFound);

export default app;
