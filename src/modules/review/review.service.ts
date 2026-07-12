import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { OrderStatus } from "../../../generated/prisma/enums";

interface ICreateReviewInput {
  gearItemId: string;
  rating: number;
  comment: string;
}

const createReviewIntoDB = async (customerId: string, payload: ICreateReviewInput) => {
  const { gearItemId, rating, comment } = payload;

  if (rating < 1 || rating > 5) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
  }

  // Business rule: Verify customer rented this gear item and returned it
  const rented = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      status: OrderStatus.RETURNED,
      orderItems: {
        some: {
          gearItemId,
        },
      },
    },
  });

  if (!rented) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review gear items you have rented and returned"
    );
  }

  const result = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      gearItem: true,
    },
  });

  return result;
};

export const reviewService = {
  createReviewIntoDB,
};
