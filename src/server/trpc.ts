import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import SuperJSON from "superjson";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "@/utils/auth/tokens";
import { calculateSessionExpiryTime, renewSession } from "@/utils/sessions";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  tokens,
} from "@/utils/cookies";

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

  const accessToken = ctx.req.cookies[tokens.ACCESS];
  const refreshToken = ctx.req.cookies[tokens.REFRESH];

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

      const newAccessToken = await generateAccessToken({
        userId: verifiedRefreshToken.userId /*role: userRole*/,
      });
      const newRefreshToken = await generateRefreshToken(
        { userId: verifiedRefreshToken.userId, sessionId: session.id },
        session.expiresAt,
      );

      await setAccessTokenCookie(newAccessToken, ctx.req, ctx.res);
      await setRefreshTokenCookie(newRefreshToken, ctx.req, ctx.res);

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
