import { deleteCookie, setCookie } from "cookies-next";
import { getTokenExpiry } from "@/utils/auth/tokens";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage, ServerResponse } from "http";

export const tokens = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
};

export async function setAccessTokenCookie(
  token: string,
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse,
) {
  setCookie(tokens.ACCESS, token, {
    req: req,
    res: res,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: createMaxAgeFromJWT(token),
  });
}

export async function setRefreshTokenCookie(
  token: string,
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse,
) {
  setCookie(tokens.REFRESH, token, {
    req: req,
    res: res,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: createMaxAgeFromJWT(token),
  });
}

export function removeAuthCookies(
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse,
) {
  deleteCookie(tokens.ACCESS, { req, res });
  deleteCookie(tokens.REFRESH, { req, res });
}

/**
 * Translates JWT's absolute expiry timestamp (exp claim) into a maxAge relative timestamp for cookies.
 */
function createMaxAgeFromJWT(token: string) {
  const tokenExpiry = getTokenExpiry(token);

  if (tokenExpiry == null) {
    return undefined;
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const buffer = 10;

  // ensure maxAge is non-negative
  const maxAge = Math.max(0, tokenExpiry - currentTimeInSeconds - buffer);

  return maxAge;
}
