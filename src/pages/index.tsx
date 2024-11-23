import Dialog from "@/components/dialog";
import LoginForm from "@/components/login-form";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import logger from "@/utils/logger";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useReducer } from "react";
import SuperJSON from "superjson";

type FormState = "signup" | "login" | null;

type Action = { type: "SIGNUP" | "LOGIN" | "RESET" };

const initialState: FormState = null;

const reducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case "SIGNUP":
      return "signup";
    case "LOGIN":
      return "login";
    case "RESET":
      return null;
    default:
      return state;
  }
};

export default function Home() {
  const utils = trpc.useUtils();
  const { data: user } = trpc.me.useQuery();
  const { mutate: logout } = trpc.signout.useMutation({
    onSuccess: () => utils.invalidate(),
  });

  const { data: hello } = trpc.hello.useQuery();

  const [dialogToOpen, openDialog] = useReducer(reducer, initialState);

  return (
    <div className="pancake-stack content-wrapper">
      <header></header>
      <main>
        <h1>{(user && hello?.greeting) || "Signed out."}</h1>
        <div className="flex gap-2">
          <button onClick={() => logger.log(user?.id)}>Show User ID</button>
          {user ? (
            <button onClick={() => logout()} disabled={!user}>
              Logout
            </button>
          ) : (
            <>
              <Dialog
                title="Login To Your Account"
                triggerText={"Login"}
                isOpen={dialogToOpen === "login"}
                setOpen={() =>
                  openDialog({
                    type: dialogToOpen === "login" ? "RESET" : "LOGIN",
                  })
                }
              >
                <LoginForm onSubmitted={() => openDialog({ type: "RESET" })} />
              </Dialog>
              <Link href="/sign-up">Sign up</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const helpers = createServerSideHelpers({
      router: appRouter,
      ctx: await createContextInner({ req: context.req, res: context.res }),
      transformer: SuperJSON,
    });

    await Promise.all([helpers.me.fetch(), helpers.hello.fetch()]);

    return {
      props: {
        trpcState: helpers.dehydrate(),
      },
    };
  } catch (err) {
    logger.error("err:", err);
    return {
      props: {
        trpcState: {},
      },
    };
  }
}
