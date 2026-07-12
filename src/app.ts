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
import { stripe } from "./lib/stripe";
import { paymentService } from "./modules/payment/payment.service";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

const endpointSecret = config.stripe_webhook_secret;

// Stripe Webhook Endpoint (Must be registered before express.json() parser)
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (request: Request, response: Response): Promise<any> => {
    try {
      let event = request.body;
      console.log("[STRIPE] Webhook received");

      if (endpointSecret) {
        const signature = request.headers["stripe-signature"];
        if (!signature) {
          console.error("[STRIPE ERROR] Missing stripe-signature header");
          return response.status(400).json({
            message: "Missing stripe-signature header",
          });
        }

        try {
          event = stripe.webhooks.constructEvent(
            request.body,
            signature,
            endpointSecret
          );
          console.log("[STRIPE] Signature verified successfully");
        } catch (err: any) {
          console.error(
            "[STRIPE ERROR] Webhook signature verification failed:",
            err.message
          );
          return response.status(400).json({
            message: err.message,
          });
        }
      }

      console.log("[STRIPE] Event type:", event.type);

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as any;
          console.log(
            `[STRIPE] PaymentIntent for ${paymentIntent.amount} was successful!`
          );
          await paymentService.confirmPaymentIntoDB(paymentIntent.id);
          break;
        default:
          console.log(`[STRIPE] Unhandled event type: ${event.type}`);
      }

      response.status(200).send({ success: true });
    } catch (error: any) {
      console.error(
        "[STRIPE ERROR] Unexpected error in webhook handler:",
        error.message
      );
      response.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
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
