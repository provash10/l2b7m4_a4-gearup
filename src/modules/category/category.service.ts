import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./category.interface";

const createCategoryIntoDB = async (payload: ICreateCategory) => {
  const slug = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const result = await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
  });
  return result;
};

const getAllCategoriesIntoDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoriesIntoDB,
};
