import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { TextEncoder } from "util";
import { z, ZodError } from "zod";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export const accessTokenSchema = z.object({
  userId: z.string(),
  role: z.string().optional(),
});
export const refreshTokenSchema = z.object({
  userId: z.string(),
});

export type AccessToken = z.infer<typeof accessTokenSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;

export async function verifyToken<T extends "access" | "refresh">(
  token: string,
  type: T,
): Promise<T extends "access" ? AccessToken | null : RefreshToken | null> {
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const tokenParser =
    type === "access" ? accessTokenSchema : refreshTokenSchema;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    const validatedPayload = tokenParser.parse(payload);

    return validatedPayload;
  } catch (err) {
    console.error(`Failed to verify ${type} token:`, err);

    return null;
  }
}

export async function generateToken(
  payload: AccessToken | RefreshToken,
  type: "access" | "refresh",
) {
  const expiryOffset = type === "access" ? "15m" : "7d";
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiryOffset)
    .sign(new TextEncoder().encode(secret));

  return token;
}

// client-safe utils
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
    console.error("Failed to verify access token:", error);

    // treat error as expired
    return true;
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
      console.error("Invalid access token:", error);

      return null;
    }

    throw error;
  }
}