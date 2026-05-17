import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, type RefreshTokenPayload } from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";

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

export const loginUser = async (data: { email: string; password: string }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  // 2. Generic error message to prevent user enumeration
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 3. Verify password
  const isMatch = await comparePassword(data.password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 4. Create refresh token record in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);  

  const tokenRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(), // placeholder, replaced below
      expiresAt,
    },
  });

  // 5. Sign tokens — tokenId links JWT to DB record for revocation
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: tokenRecord.id,
  });

  // 6. Store the actual signed JWT in DB
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { token: refreshToken },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};



export const refreshTokens = async (token: string) => {
  // 1. Verify JWT signature and expiry
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // 2. Find token record in DB
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  // 3. Reuse detection: a valid JWT pointing at a revoked DB record
  // means an old refresh token was replayed — assume token theft and
  // revoke every active refresh token for this user.
  if (
    tokenRecord &&
    tokenRecord.token === token &&
    tokenRecord.revokedAt !== null
  ) {
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw ApiError.unauthorized('Refresh token reuse detected — all sessions revoked');
  }

  // 4. Check record exists, matches, and is not expired
  if (
    !tokenRecord ||
    tokenRecord.token !== token ||
    tokenRecord.expiresAt < new Date()
  ) {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  // 4. Revoke old token immediately — token rotation
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });

  // 5. Issue new refresh token record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const newTokenRecord = await prisma.refreshToken.create({
    data: {
      userId: tokenRecord.userId,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  // 6. Sign new token pair
  const newAccessToken = signAccessToken({
    sub: tokenRecord.user.id,
    email: tokenRecord.user.email,
  });

  const newRefreshToken = signRefreshToken({
    sub: tokenRecord.user.id,
    tokenId: newTokenRecord.id,
  });

  // 7. Store signed refresh token
  await prisma.refreshToken.update({
    where: { id: newTokenRecord.id },
    data: { token: newRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


export const logoutUser = async (token: string) => {
  // 1. Verify JWT signature first
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // 2. Find token record
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
  });

  // 3. Already revoked or doesn't exist — treat as success, no info leak
  if (!tokenRecord || tokenRecord.revokedAt !== null) {
    return;
  }

  // 4. Revoke it
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};