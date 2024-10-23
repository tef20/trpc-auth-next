import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

type CreateInnerContextOptions =
  | Partial<CreateNextContextOptions>
  | {
      req: IncomingMessage & { cookies: NextApiRequestCookies };
      res: ServerResponse;
    };
// & {
//   session: Session | null;
// };

export async function createContextInner(opts: CreateInnerContextOptions) {
  // return {
  //   userId: opts.userId,
  // };
  return opts;
}

export async function createContext(opts: CreateNextContextOptions) {
  const contextInner = await createContextInner({});

  return {
    ...contextInner,
    req: opts.req,
    res: opts.res,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
