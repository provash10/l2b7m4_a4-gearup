import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearItemService } from "./gearItem.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await gearItemService.getAllGearIntoDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear items retrieved successfully",
      data: result,
    });
  }
);

const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await gearItemService.getGearByIdIntoDB(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item details retrieved successfully",
      data: result,
    });
  }
);

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const result = await gearItemService.createGearIntoDB(providerId as string, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear item added successfully",
      data: result,
    });
  }
);

const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const { id } = req.params;
    const result = await gearItemService.updateGearIntoDB(
      providerId as string,
      id as string,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item updated successfully",
      data: result,
    });
  }
);

const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const { id } = req.params;
    const result = await gearItemService.deleteGearIntoDB(
      providerId as string,
      id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item removed successfully",
      data: result,
    });
  }
);

const adminGetAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await gearItemService.adminGetAllGearIntoDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All gear listings retrieved successfully",
      data: result,
    });
  }
);

export const gearController = {
  getAllGear,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
  adminGetAllGear,
};
