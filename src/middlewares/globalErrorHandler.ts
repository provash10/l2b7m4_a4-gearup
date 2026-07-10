import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: err,
  });
};
