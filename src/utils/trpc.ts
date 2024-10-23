import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type AppRouter } from "@/server/routers/_app";
import SuperJSON from "superjson";

function getBaseUrl() {
  // browser should use relative path
  if (typeof window !== "undefined") return "";

  // reference for vercel.com
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config(/* opts */) {
    return {
      // todo: add return journey link to handle CSRF token
      links: [
        httpBatchLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
  transformer: SuperJSON,
});
