import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRental = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const result = await rentalService.createRentalIntoDB(customerId as string, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental order placed successfully",
      data: result,
    });
  }
);

const getCustomerRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const result = await rentalService.getCustomerRentalsIntoDB(customerId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental orders retrieved successfully",
      data: result,
    });
  }
);

const getRentalById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;
    const result = await rentalService.getRentalByIdIntoDB(userId as string, id as string, role as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order details retrieved successfully",
      data: result,
    });
  }
);

const getProviderOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const result = await rentalService.getProviderOrdersIntoDB(providerId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider incoming orders retrieved successfully",
      data: result,
    });
  }
);

const updateOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;
    const result = await rentalService.updateOrderStatusIntoDB(providerId as string, id as string, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order status updated successfully",
      data: result,
    });
  }
);

const adminGetAllRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.adminGetAllRentalsIntoDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rental orders retrieved successfully",
      data: result,
    });
  }
);

export const rentalController = {
  createRental,
  getCustomerRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
  adminGetAllRentals,
};
