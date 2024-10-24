import { generateToken, verifyToken } from "@/utils/auth/tokens";
import { getTokenExpiryTimeOffset } from "@/utils/sessions";
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const payload = await verifyToken(refreshToken, "refresh");

    if (!payload) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const newAccessToken = await generateToken(
      {
        userId: payload.userId,
      },
      "access",
    );

    const newRefreshToken = await generateToken(
      {
        userId: payload.userId,
      },
      "refresh",
    );

    // todo: ensure max-age is synced with JWTs
    setCookie("accessToken", newAccessToken, {
      req,
      res,
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      // 15 minutes + 30 seconds buffer
      maxAge: getTokenExpiryTimeOffset("access") + 30,
    });

    setCookie("X-Token-Max-Age", 15 * 60 + 30, {
      req,
      res,
      secure: true,
      sameSite: "lax",
    });

    setCookie("refreshToken", newRefreshToken, {
      req,
      res,
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      // 1 week + 30 seconds buffer
      maxAge: getTokenExpiryTimeOffset("refresh") + 30,
      path: "/api/auth/refresh-tokens",
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error refreshing tokens:", err);

    return res.status(500).json({ message: "Internal server error" });
  }
}
