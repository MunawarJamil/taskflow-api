import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // 1. Check if email already taken
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw ApiError.conflict("Email already in use");
  }

  // 2. Hash password
  const passwordHash = await hashPassword(data.password);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
  });

  return user;
};
