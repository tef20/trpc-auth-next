import Dialog from "@/components/dialog";
import LoginForm from "@/components/login-form";
import SignUpForm from "@/components/sign-up-form";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
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
    onSuccess: () => utils.me.invalidate(),
  });

  const { data: hello } = trpc.hello.useQuery();

  const [dialogToOpen, openDialog] = useReducer(reducer, initialState);

  return (
    <div className={`flex min-h-1 flex-col`}>
      <h1>Status: {(user && hello?.greeting) || "Signed out."}</h1>
      <div className="flex gap-2">
        <Dialog
          title="Create Your Account"
          triggerText={"Sign up"}
          isOpen={dialogToOpen === "signup"}
          setOpen={() => openDialog({ type: "SIGNUP" })}
        >
          <SignUpForm onSubmitted={() => openDialog({ type: "RESET" })} />
        </Dialog>

        <button onClick={() => console.log(user?.id)}>Show User ID</button>
        <Dialog
          title="Login To Your Account"
          triggerText={"Login"}
          isOpen={dialogToOpen === "login"}
          setOpen={() => openDialog({ type: "LOGIN" })}
        >
          <LoginForm onSubmitted={() => openDialog({ type: "RESET" })} />
        </Dialog>
        <button onClick={() => logout()} disabled={!user}>
          Logout
        </button>
        <button
          disabled
          onClick={() => console.log("Attempting protected action", user?.id)}
        >
          Auth protected action
        </button>
        {
          // auth protected content...
        }
      </div>
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
    console.error("err:", err);
    return {
      props: {
        trpcState: {},
      },
    };
  }
}
