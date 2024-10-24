import { router } from "@/server/trpc";
import { hello, login, me, signout, signup } from "@/server/routers/user";

export const appRouter = router({
  signup: signup,
  login: login,
  signout: signout,
  me: me,
  hello: hello,
});

// API type definition
export type AppRouter = typeof appRouter;
