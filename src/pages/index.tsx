import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import SuperJSON from "superjson";

export default function Home() {
  // const user = useUser();
  const { data: user } = trpc.me.useQuery();
  const { mutate: logout } = trpc.signOut.useMutation();

  const { data: hello } = trpc.hello
    .useQuery

    // { enabled: typeof user?.id === "string" },
    ();

  const { mutate: signUp } = trpc.signUp.useMutation({
    // onSuccess(opts) {
    //   setUser(opts.user);
    // },
  });

  const { mutate: login } = trpc.login.useMutation({
    // onSuccess(opts) {
    //   setUser(opts.user);
    // },
  });

  return (
    <div className={`flex min-h-1 flex-col`}>
      <h1>Status: {(user && hello?.greeting) || "Signed out."}</h1>
      {/* <button onClick={() => console.log(user)}>Hello</button> */}
      <div className="flex gap-2">
        <button
          onClick={async () =>
            signUp({ email: "testUser", password: "testPassword" })
          }
        >
          Sign Up
        </button>
        <button onClick={() => console.log(user?.id)}>Show User ID</button>
        <button
          onClick={() => login({ email: "testUser", password: "testPassword" })}
          disabled={!!user}
        >
          Login
        </button>
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

    const name = "some name";
    console.log("name:", name);

    // await helpers.hello.prefetch({ name });
    await helpers.me.fetch();
    await helpers.hello.fetch();

    return {
      props: {
        trpcState: helpers.dehydrate(),
      },
    };
  } catch (err) {
    console.error("err:", err);
    console.log("Not authenticated");
    return {
      props: {
        trpcState: {},
      },
    };
  }
}
