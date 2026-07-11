import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const { rentalOrderId, method } = req.body;
    const result = await paymentService.createPaymentIntentIntoDB(
      customerId as string,
      rentalOrderId,
      method
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment session created successfully",
      data: result,
    });
  }
);
const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.body;
    const result = await paymentService.confirmPaymentIntoDB(transactionId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment confirmed and verified successfully",
      data: result,
    });
  }
);

const getUserPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const result = await paymentService.getUserPayments(userId as string, role as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history retrieved successfully",
      data: result,
    });
  }
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;
    const result = await paymentService.getPaymentById(userId as string, id as string, role as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details retrieved successfully",
      data: result,
    });
  }
);

export const paymentController = {
    createPayment,
    confirmPayment,
    getUserPayments,
    getPaymentById
}