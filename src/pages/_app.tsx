// import { AuthProvider } from "@/context/auth-context";
import "@/styles/globals.css";
import { trpc } from "@/utils/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ReactQueryDevtools />
      {/* <AuthProvider> */}
      <Component {...pageProps} />
      {/* </AuthProvider> */}
    </>
  );
}

export default trpc.withTRPC(App);
