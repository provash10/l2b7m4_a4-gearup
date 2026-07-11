import { OrderStatus, PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";


const createPaymentIntentIntoDB = async (customerId: string, rentalOrderId: string, method: PaymentMethod) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: {
      customer: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (order.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not own this rental order");
  }

  if (order.status !== OrderStatus.PLACED && order.status !== OrderStatus.CONFIRMED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot pay for an order with status "${order.status}"`
    );
  }

  if (method === PaymentMethod.STRIPE) {
    // Create stripe payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // stripe expects cents
        currency: "usd",
        metadata: {
          rentalOrderId: order.id,
          customerId,
        },
      });

      // Save payment intent
      const payment = await prisma.payment.create({
        data: {
          transactionId: paymentIntent.id,
          rentalOrderId: order.id,
          amount: order.totalAmount,
          method: PaymentMethod.STRIPE,
          status: PaymentStatus.PENDING,
        },
      });

      return {
        paymentId: payment.id,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: order.totalAmount,
      };
    } catch (error: any) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Stripe Error: ${error.message}`
      );
    }
  } else {
    // SSLCOMMERZ mock integration
    const transactionId = `SSLC-TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await prisma.payment.create({
      data: {
        transactionId,
        rentalOrderId: order.id,
        amount: order.totalAmount,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: payment.id,
      transactionId,
      gatewayUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php?session_id=${transactionId}`,
      amount: order.totalAmount,
    };
  }
};

const confirmPaymentIntoDB = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: {
      rentalOrder: true,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  return await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    // Update rental order status
    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: {
        status: OrderStatus.PAID,
      },
    });

    return updatedPayment;
  });
};

const getUserPayments = async (userId: string, role: string) => {
  if (role === "ADMIN") {
    return await prisma.payment.findMany({
      include: {
        rentalOrder: {
          include: {
            customer: {
              omit: {
                password: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    return await prisma.payment.findMany({
      where: {
        rentalOrder: {
          customerId: userId,
        },
      },
      include: {
        rentalOrder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
};

const getPaymentById = async (userId: string, paymentId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
          customer: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment details not found");
  }

  if (role !== "ADMIN" && payment.rentalOrder.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this payment");
  }

  return payment;
};



export const paymentService = {
  createPaymentIntentIntoDB,
  confirmPaymentIntoDB,
  getUserPayments,
  getPaymentById
  
};
