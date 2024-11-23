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
import {
  generateNonce,
  sendWelcomeEmail,
  verifyPassword,
} from "@/utils/auth/accounts";
import {
  emailVerificationOTPFormSchema,
  emailVerificationRequestFormSchema,
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
import logger from "@/utils/logger";
import {
  cleanupUnverifiedUser,
  createNewUnverifiedUser,
  getUnverifiedUserCredentialsByEmail,
  sendVerificationEmail,
  verifyUserEmail,
} from "@/utils/pending-users";

export const requestEmailVerification = publicProcedure
  .input(emailVerificationRequestFormSchema)
  .mutation(async (opts) => {
    if (!opts.ctx.req || !opts.ctx.res) {
      throw new Error("Request/Response objects are required!");
    }

    try {
      const verificationCode = String(await generateNonce());

      await createNewUnverifiedUser({
        email: opts.input.email,
        username: opts.input.username,
        verificationCode,
      });

      await sendVerificationEmail({
        email: opts.input.email,
        username: opts.input.username,
        code: verificationCode,
      });

      return { message: "verification email sent" };
    } catch (err) {
      logger.error("err:", err);

      throw new Error("Unauthorized");
    }
  });

export const checkEmailVerificationOTP = publicProcedure
  .input(emailVerificationOTPFormSchema)
  .mutation(async (opts) => {
    if (!opts.ctx.req || !opts.ctx.res) {
      throw new Error("Request/Response objects are required!");
    }

    try {
      const { email, code } = opts.input;

      await verifyUserEmail(email, code);

      return { success: true };
    } catch (err) {
      logger.error("err:", err);

      throw new Error("Failed to complete signup");
    }
  });

export const signup = publicProcedure
  .input(signupFormSchema)
  .mutation(async (opts) => {
    try {
      if (!opts.ctx.req || !opts.ctx.res) {
        throw new Error("Request/Response objects are required!");
      }
      // check email has been verified
      //   - get user id from unverified users table
      const user = await getUnverifiedUserCredentialsByEmail(opts.input.email);

      if (!user) {
        throw new Error("Unauthorized");
      }

      const username = user.username;

      const newUser = await createNewUser({
        email: opts.input.email,
        username: username,
        password: opts.input.password,
        isVerified: true,
      });

      await cleanupUnverifiedUser(opts.input.email);

      // send welcome email
      sendWelcomeEmail({
        email: opts.input.email,
        username: username,
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
      logger.error("err:", err);

      throw new Error("Failed to complete signup");
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

      if (user.passwordHash == null) {
        // user exists but has probably not been verified
        throw new Error("Unauthorized");
      }

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
      logger.error("err:", err);

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
    logger.error("err:", err);

    throw new Error("Server error");
  }
});
