import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "@/server/trpc";
import { generateToken } from "@/utils/auth/tokens";
import { deleteCookie, setCookie } from "cookies-next";

export const appRouter = router({
  // todo implement refreshTokens procedure
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async (opts) => {
      if (!opts.ctx.req || !opts.ctx.res) {
        throw new Error("Request/Response objects are required!");
      }

      // create new user in DB
      const newUser = {
        id: "1",
      };

      const newAccessToken = await generateToken(
        {
          userId: newUser.id,
          // todo: add user role
        },
        "access",
      );

      const newRefreshToken = await generateToken(
        {
          userId: newUser.id,
        },
        "refresh",
      );

      setCookie("accessToken", newAccessToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 15 minutes + 30 seconds buffer
        maxAge: 15 * 60 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 1 week + 30 seconds buffer
        maxAge: 7 * 24 * 60 * 60 + 30,
      });

      return { user: newUser };
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async (opts) => {
      if (!opts.ctx.req || !opts.ctx.res) {
        throw new Error("Request/Response objects are required!");
      }

      // get user from DB
      const user = {
        id: "1",
      };

      const newAccessToken = await generateToken(
        {
          userId: user.id,
          // todo: add user role
        },
        "access",
      );

      const newRefreshToken = await generateToken(
        {
          userId: user.id,
        },
        "refresh",
      );

      setCookie("accessToken", newAccessToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 15 minutes + 30 seconds buffer
        maxAge: 15 * 60 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        // 1 week + 30 seconds buffer
        maxAge: 7 * 24 * 60 * 60 + 30,
      });

      return { user };
    }),
  signOut: publicProcedure.mutation((opts) => {
    if (!opts.ctx.req || !opts.ctx.res) {
      throw new Error("Request/Response objects are required!");
    }

    deleteCookie("accessToken", {
      req: opts.ctx.req,
      res: opts.ctx.res,
    });
    deleteCookie("refreshToken", {
      req: opts.ctx.req,
      res: opts.ctx.res,
    });

    return { user: null };
  }),
  me: protectedProcedure.query((opts) => {
    return opts.ctx.user;
  }),
  hello: protectedProcedure.query((opts) => {
    console.log("HELLO!");
    console.log("ctx:", opts.ctx.user);

    return {
      // greeting: `Hello ${opts.input.name}`,
      greeting: `Hello person...`,
    };
  }),
});

// API type definition
export type AppRouter = typeof appRouter;
