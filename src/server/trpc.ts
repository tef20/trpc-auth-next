import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import SuperJSON from "superjson";
import { generateToken, verifyToken } from "@/utils/auth/tokens";
import { setCookie } from "cookies-next";

// Base router and procedure helpers
const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

export const router = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
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
      const newAccessToken = await generateToken(
        { userId: verifiedRefreshToken.userId /*role: userRole*/ },
        "access",
      );
      const newRefreshToken = await generateToken(
        { userId: verifiedRefreshToken.userId },
        "refresh",
      );

      setCookie("accessToken", newAccessToken, {
        req: ctx.req,
        res: ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 15 minutes + 30 seconds buffer
        maxAge: 15 * 60 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: ctx.req,
        res: ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 1 week + 30 seconds buffer
        maxAge: 7 * 24 * 60 * 60 + 30,
      });

      return next({
        ctx: {
          ...ctx,
          user: { id: verifiedRefreshToken.userId /*role: userRole*/ },
        },
      });
    }
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Sorry, not authorized",
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
