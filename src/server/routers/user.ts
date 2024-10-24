import {
  enforceUserIsAuthed,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc";
import { deleteCookie, setCookie } from "cookies-next";
import { generateToken, getSessionIdFromToken } from "@/utils/auth/tokens";
import { verifyPassword } from "@/utils/auth/accounts";
import {
  loginFormSchema,
  signupFormSchema,
} from "@/server/routers/user-schema";
import {
  createNewUser,
  getUserById,
  getUserCredentialsByEmail,
} from "@/utils/users";
import {
  calculateSessionExpiryTime,
  createSession,
  getTokenExpiryTimeOffset,
  invalidateSession,
} from "@/utils/sessions";

export const signup = publicProcedure
  .input(signupFormSchema)
  .mutation(async (opts) => {
    if (!opts.ctx.req || !opts.ctx.res) {
      throw new Error("Request/Response objects are required!");
    }

    try {
      const newUser = await createNewUser({
        email: opts.input.email,
        password: opts.input.password,
      });

      const session = await createSession(newUser.id);

      const accessTokenExpiryTime = calculateSessionExpiryTime("access");
      const refreshTokenExpiryTime = session.expiresAt;

      const newAccessToken = await generateToken(
        {
          userId: newUser.id,
          // todo: add user role here
        },
        "access",
        accessTokenExpiryTime,
      );

      const newRefreshToken = await generateToken(
        {
          userId: newUser.id,
          sessionId: session.id,
        },
        "refresh",
        refreshTokenExpiryTime,
      );

      setCookie("accessToken", newAccessToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // 15 minutes + 30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("access") / 1000 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // 1 week + 30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("refresh") / 1000 + 30,
      });

      return { user: newUser };
    } catch (err) {
      console.error("err:", err);

      throw new Error("Unauthorized");
    }
  });

export const login = publicProcedure
  .input(loginFormSchema)
  .mutation(async (opts) => {
    try {
      if (!opts.ctx.req || !opts.ctx.res) {
        throw new Error("Request/Response objects are required!");
      }

      const user = await getUserCredentialsByEmail(opts.input.email);

      const passwordIsValid = await verifyPassword(
        opts.input.password,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        throw new Error("Unauthorized");
      }

      const session = await createSession(user.id);

      const accessTokenExpiryTime = calculateSessionExpiryTime("access");
      const refreshTokenExpiryTime = session.expiresAt;

      const newAccessToken = await generateToken(
        {
          userId: user.id,
          // todo: add user role here
        },
        "access",
        accessTokenExpiryTime,
      );

      const newRefreshToken = await generateToken(
        {
          userId: user.id,
          sessionId: session.id,
        },
        "refresh",
        refreshTokenExpiryTime,
      );

      setCookie("accessToken", newAccessToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // 15 minutes + 30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("access") / 1000 + 30,
      });

      setCookie("refreshToken", newRefreshToken, {
        req: opts.ctx.req,
        res: opts.ctx.res,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        // 1 week + 30 seconds buffer
        maxAge: getTokenExpiryTimeOffset("refresh") / 1000 + 30,
      });

      return { user };
    } catch (err) {
      console.error("err:", err);

      throw new Error("Unauthorized");
    }
  });

export const signout = publicProcedure.mutation(async (opts) => {
  if (!opts.ctx.req || !opts.ctx.res) {
    throw new Error("Request/Response objects are required!");
  }

  const refreshToken = opts.ctx.req.cookies["refreshToken"];

  if (refreshToken) {
    const sessionId = getSessionIdFromToken(refreshToken);

    if (sessionId) {
      await invalidateSession(sessionId);
    }
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
});

export const me = publicProcedure
  .meta({ noThrow: true })
  .use(enforceUserIsAuthed)
  .query((opts) => {
    return opts.ctx.user;
  });

export const hello = protectedProcedure.query(async (opts) => {
  try {
    const user = await getUserById(opts.ctx.user.id);

    return { greeting: `Hello, ${user.username}!` };
  } catch (err) {
    console.error("err:", err);

    throw new Error("Server error");
  }
});
