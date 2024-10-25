import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { TextEncoder } from "util";
import { z, ZodError } from "zod";
import { calculateSessionExpiryTime } from "@/utils/auth/sessions";
import { env } from "@/env.mjs";
import logger from "@/utils/logger";

const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;

export const accessTokenSchema = z.object({
  userId: z.string(),
  role: z.string().optional(),
});
export const refreshTokenSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
});

export type AccessToken = z.infer<typeof accessTokenSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;

// export async function verifyToken<T extends "access" | "refresh">(
export async function verifyToken<T extends "access" | "refresh">(
  token: string,
  type: T,
) {
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const tokenParser =
    type === "access" ? accessTokenSchema : refreshTokenSchema;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    const validatedPayload = tokenParser.parse(payload);

    return validatedPayload as T extends "access" ? AccessToken : RefreshToken;
  } catch (err) {
    logger.error(`Failed to verify ${type} token:`, err);

    return null;
  }
}

export async function generateAccessToken(payload: AccessToken) {
  return await generateToken(
    payload,
    ACCESS_TOKEN_SECRET,
    calculateSessionExpiryTime("access"),
  );
}

export async function generateRefreshToken(
  payload: RefreshToken,
  expiresAt?: number | string | Date,
) {
  return await generateToken(
    payload,
    REFRESH_TOKEN_SECRET,
    expiresAt ?? calculateSessionExpiryTime("access"),
  );
}

async function generateToken(
  payload: AccessToken | RefreshToken,
  secret: string,
  expiresAt: number | string | Date,
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .sign(new TextEncoder().encode(secret));

  return token;
}

// client-safe utils
export function getTokenExpiry(token: string) {
  try {
    const decodedToken = decodeJwt(token);

    return decodedToken.exp;
  } catch (error) {
    logger.error("Failed to verify access token:", error);

    return null;
  }
}

export function isTokenExpired(token: string) {
  try {
    const decodedToken = decodeJwt(token);

    // if no exp claim, treat as expired
    if (!decodedToken.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime > decodedToken.exp;
  } catch (error) {
    logger.error("Failed to verify access token:", error);

    // treat error as expired
    return true;
  }
}

export function getSessionIdFromToken(token: string) {
  try {
    const decodedToken = decodeJwt(token);

    return z
      .object({
        sessionId: z.string(),
      })
      .parse(decodedToken).sessionId;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Invalid access token:", error);

      return null;
    }

    throw error;
  }
}

export function getUserIdFromToken(token: string) {
  try {
    const decodedToken = decodeJwt(token);

    return z
      .object({
        userId: z.string(),
      })
      .parse(decodedToken).userId;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Invalid access token:", error);

      return null;
    }

    throw error;
  }
}
