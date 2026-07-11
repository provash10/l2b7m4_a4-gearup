import { AppError } from "../../errors/AppError";
import { ICreateRentalInput } from "./rental.interface";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { OrderStatus } from "../../../generated/prisma/enums";

const createRentalIntoDB = async (customerId: string, payload: ICreateRentalInput) => {
  const { startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    days = 1;
  }

  if (items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rental order must contain at least one item");
  }

  // transaction
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const gearItem = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });

      if (!gearItem) {
        throw new AppError(httpStatus.NOT_FOUND, `Gear item with ID ${item.gearItemId} not found`);
      }

      if (!gearItem.isAvailable || gearItem.stock < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Item "${gearItem.name}" is out of stock or unavailable`
        );
      }

      const itemCost = gearItem.pricePerDay * item.quantity * days;
      totalAmount += itemCost;

      orderItemsData.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        pricePerDay: gearItem.pricePerDay,
      });

      // Deduct stock temporarily or during booking
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: OrderStatus.PLACED,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            gearItem: true,
          },
        },
      },
    });

    return order;
  });
};

const getCustomerRentalsIntoDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: {
          gearItem: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const getRentalByIdIntoDB = async (userId: string, orderId: string, role: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      orderItems: {
        include: {
          gearItem: {
            include: {
              provider: {
                omit: {
                  password: true,
                },
              },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // Authorization check: Admin can view all. Customer can view their own.
  // Provider can view if they own any item in the order.
  if (role === "ADMIN") {
    return order;
  }
  if (role === "CUSTOMER" && order.customerId === userId) {
    return order;
  }
  if (role === "PROVIDER") {
    const hasOwnItem = order.orderItems.some(
      (item) => item.gearItem.providerId === userId
    );
    if (hasOwnItem) {
      return order;
    }
  }

  throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this order");
};

const getProviderOrdersIntoDB = async (providerId: string) => {
  // get all orders containing items of provider
  const result = await prisma.rentalOrder.findMany({
    where: {
      orderItems: {
        some: {
          gearItem: {
            providerId,
          },
        },
      },
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      orderItems: {
        where: {
          gearItem: {
            providerId,
          },
        },
        include: {
          gearItem: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const updateOrderStatusIntoDB = async (
  providerId: string,
  orderId: string,
  status: OrderStatus
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // ensure provider owns at least one item in the order
  const hasOwnItem = order.orderItems.some(
    (item) => item.gearItem.providerId === providerId
  );
  if (!hasOwnItem) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot update the status of this order as it contains no items listed by you"
    );
  }

  // handle stock restock on cancel or return
  if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });
  } else if (status === OrderStatus.RETURNED && order.status !== OrderStatus.RETURNED) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });
  }

  const result = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
    include: {
      orderItems: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  return result;
};

const adminGetAllRentalsIntoDB = async () => {
  const result = await prisma.rentalOrder.findMany({
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      orderItems: {
        include: {
          gearItem: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

export const rentalService = {
  createRentalIntoDB,
  getCustomerRentalsIntoDB,
  getRentalByIdIntoDB,
  getProviderOrdersIntoDB,
  updateOrderStatusIntoDB,
  adminGetAllRentalsIntoDB,
};
