import { prisma } from "../../lib/prisma";
import { ActiveStatus } from "../../../generated/prisma/enums";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    omit: {
      password: true,
    },
  });
  return result;
};

const updateUserStatus = async (userId: string, activeStatus: ActiveStatus) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus },
    omit: {
      password: true,
    },
  });
  return result;
};

//update profile
const updateMyProfile = async (
  userId: string,
  payload: { name?: string; profilePhoto?: string }
) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: payload,
    omit: {
      password: true,
    },
  });
  return result;
};

export const userService = {
  getAllUsers,
  updateUserStatus,
  updateMyProfile,
};
