import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import SuperJSON from "superjson";
import { generateToken, verifyToken } from "@/utils/auth/tokens";
import { setCookie } from "cookies-next";
import {
  calculateSessionExpiryTime,
  getTokenExpiryTimeOffset,
  renewSession,
} from "@/utils/sessions";

type Meta = {
  noThrow?: boolean;
};

// Base router and procedure helpers
const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({ transformer: SuperJSON });

export const router = t.router;

export const publicProcedure = t.procedure;

export const enforceUserIsAuthed = t.middleware(async ({ ctx, next, meta }) => {
  if (!ctx.req || !ctx.res) {
    throw new Error("Request/Response objects are required!");
  }

  const accessToken = ctx.req.cookies["accessToken"];
  const refreshToken = ctx.req.cookies["refreshToken"];

  if (accessToken) {
    const verifiedAccessToken = await verifyToken(accessToken, "access");

    if (verifiedAccessToken) {
      return next({
        ctx: {
          ...ctx,
          user: { id: verifiedAccessToken.userId },
        },
      });
    }
  }

  if (refreshToken) {
    const verifiedRefreshToken = await verifyToken(refreshToken, "refresh");

    if (verifiedRefreshToken) {
      // todo: implement add user role from DB using userId
      // const userRole = await getUserRole(verifiedRefreshToken.userId);

      const session = await renewSession(
        verifiedRefreshToken.sessionId,
        verifiedRefreshToken.userId,
      );

      const accessTokenExpiryTime = calculateSessionExpiryTime("access");

      const refreshTokenExpiryTime = session.expiresAt;

      const newAccessToken = await generateToken(
        { userId: verifiedRefreshToken.userId /*role: userRole*/ },
        "access",
        accessTokenExpiryTime,
      );

      const newRefreshToken = await generateToken(
        { userId: verifiedRefreshToken.userId, sessionId: session.id },
        "refresh",
        refreshTokenExpiryTime,
      );

      setCookie("accessToken", newAccessToken, {
        req: ctx.req,
        res: ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // +30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("access") / 1000 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: ctx.req,
        res: ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // +30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("refresh") / 1000 + 30,
      });

      return next({
        ctx: {
          ...ctx,
          user: { id: verifiedRefreshToken.userId /*role: userRole*/ },
        },
      });
    }
  }

  if (meta?.noThrow) {
    return next({
      ctx: {
        ...ctx,
        user: null,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Sorry, not authorized",
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
