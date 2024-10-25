import {
  enforceUserIsAuthed,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc";
import {
  generateAccessToken,
  generateRefreshToken,
  getSessionIdFromToken,
} from "@/utils/auth/tokens";
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
import { createSession, invalidateSession } from "@/utils/auth/sessions";
import {
  removeAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  tokens,
} from "@/utils/auth/cookies";

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

      const newAccessToken = await generateAccessToken({
        userId: newUser.id,
        // todo: add user role here
      });

      const newRefreshToken = await generateRefreshToken(
        {
          userId: newUser.id,
          sessionId: session.id,
        },
        session.expiresAt,
      );

      await setAccessTokenCookie(newAccessToken, opts.ctx.req, opts.ctx.res);
      await setRefreshTokenCookie(newRefreshToken, opts.ctx.req, opts.ctx.res);

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

      const newAccessToken = await generateAccessToken({
        userId: user.id,
        // todo: add user role here
      });

      const newRefreshToken = await generateRefreshToken(
        {
          userId: user.id,
          sessionId: session.id,
        },
        session.expiresAt,
      );

      await setAccessTokenCookie(newAccessToken, opts.ctx.req, opts.ctx.res);
      await setRefreshTokenCookie(newRefreshToken, opts.ctx.req, opts.ctx.res);

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

  const refreshToken = opts.ctx.req.cookies[tokens.REFRESH];

  if (refreshToken) {
    const sessionId = getSessionIdFromToken(refreshToken);

    if (sessionId) {
      await invalidateSession(sessionId);
    }
  }

  removeAuthCookies(opts.ctx.req, opts.ctx.res);

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
