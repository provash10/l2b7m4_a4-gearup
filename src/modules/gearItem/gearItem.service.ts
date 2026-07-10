import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { IGearFilter, ICreateGear, IUpdateGear } from "./gearItem.interface";

const getAllGearIntoDB = async (filters: IGearFilter) => {
  const { categoryId, brand, minPrice, maxPrice, isAvailable, searchTerm } =
    filters;
  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (brand) {
    where.brand = {
      contains: brand,
      mode: "insensitive",
    };
  }
  if (minPrice || maxPrice) {
    where.pricePerDay = {};
    if (minPrice) {
      where.pricePerDay.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      where.pricePerDay.lte = parseFloat(maxPrice);
    }
  }
  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable === "true";
  }
  if (searchTerm) {
    where.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const result = await prisma.gearItem.findMany({
    where,
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          activeStatus: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return result;
};

const getGearByIdIntoDB = async (id: string) => {
  const result = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          activeStatus: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              activeStatus: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  return result;
};

const createGearIntoDB = async (providerId: string, payload: ICreateGear) => {
  const result = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
    },
    include: {
      category: true,
    },
  });
  return result;
};

const updateGearIntoDB = async (
  providerId: string,
  id: string,
  payload: IUpdateGear
) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not own this gear listing"
    );
  }

  const result = await prisma.gearItem.update({
    where: { id },
    data: payload,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteGearIntoDB = async (providerId: string, id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not own this gear listing"
    );
  }

  await prisma.gearItem.delete({
    where: { id },
  });

  return { success: true };
};

const adminGetAllGearIntoDB = async () => {
  const result = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          activeStatus: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return result;
};

export const gearItemService = {
  getAllGearIntoDB,
  getGearByIdIntoDB,
  createGearIntoDB,
  updateGearIntoDB,
  deleteGearIntoDB,
  adminGetAllGearIntoDB,
};
