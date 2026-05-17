import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, cleanDb, prisma } from "./helpers.js";

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

describe("Auth — Register", () => {
  it("should register a new user and return 201", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("john@example2.com");
  });

  it("should return 409 if email already exists", async () => {
    await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    const res = await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      email: "john@example2.com",
    });

    expect(res.status).toBe(400);
  });
});

describe("Auth — Login", () => {
  it("should login and return accessToken and refreshToken", async () => {
    await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    const res = await request.post("/api/v1/auth/login").send({
      email: "john@example2.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should return 401 with wrong password", async () => {
    await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    const res = await request.post("/api/v1/auth/login").send({
      email: "john@example2.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});

describe("Auth — Refresh Token", () => {
  it("should return new accessToken with valid refreshToken", async () => {
    await request.post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john@example2.com",
      password: "password123",
    });

    const login = await request.post("/api/v1/auth/login").send({
      email: "john@example2.com",
      password: "password123",
    });

    const res = await request.post("/api/v1/auth/refresh").send({
      refreshToken: login.body.data.refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
