import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

// `jsonwebtoken` types `expiresIn` as the branded `StringValue` from `ms`
// (e.g. "15m", "7d") or a number of seconds. Env vars come in as plain strings,
// so we narrow the cast to just this field instead of casting the whole options.
type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;

export interface AccessTokenPayload {
  sub: string;  // userId
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;  // userId
  tokenId: string; // RefreshToken.id from DB — used to revoke
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as ExpiresIn,
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as ExpiresIn,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};