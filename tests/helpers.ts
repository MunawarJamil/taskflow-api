import supertest from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();
export const request = supertest(app);
export { prisma };

export async function cleanDb() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerAndLogin(
  name = "Test User",
  email = "test@example.com",
  password = "password123",
) {
  await request.post("/api/v1/auth/register").send({ name, email, password });

  const res = await request
    .post("/api/v1/auth/login")
    .send({ email, password });

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    userId: res.body.data.user.id,
  };
}
