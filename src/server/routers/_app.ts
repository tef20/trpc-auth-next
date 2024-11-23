import { router } from "@/server/trpc";
import {
  checkEmailVerificationOTP,
  hello,
  login,
  me,
  requestEmailVerification,
  signout,
  signup,
} from "@/server/routers/user";

export const appRouter = router({
  login,
  signout,
  me,
  hello,
  requestEmailVerification,
  checkEmailVerificationOTP,
  signup,
});

// API type definition
export type AppRouter = typeof appRouter;
