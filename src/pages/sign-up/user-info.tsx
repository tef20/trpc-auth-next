import {
  emailVerificationOTPFormSchema,
  type SignupFormSchemaWithPasswordConfirmation,
  signupFormSchemaWithPasswordConfirmation,
  type SignupFormSchema,
} from "@/server/routers/user-schema";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { type GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function SignupUser() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormSchemaWithPasswordConfirmation>({
    resolver: zodResolver(signupFormSchemaWithPasswordConfirmation),
    mode: "onTouched",
  });

  const {
    mutate: signupUser,
    isPending: signupUserIsPending,
    isError: signupUserIsError,
    error: signupUserError,
  } = trpc.signup.useMutation();

  const { mutate: loginUser } = trpc.login.useMutation();

  function completeSignup(data: SignupFormSchema) {
    signupUser(data, {
      onSuccess: () => {
        loginUser(data, {
          onSuccess: () => {
            router.push("/");
          },
        });
      },
    });
  }

  return (
    <div className="pancake-stack content-wrapper">
      <form
        className="flow flex flex-col"
        onSubmit={handleSubmit(completeSignup)}
      >
        <label className="flex items-center gap-2" htmlFor="email">
          Email
          {errors.email && (
            <span className="text-red-500" role="alert">
              {errors.email.message}
            </span>
          )}
        </label>
        <input
          style={{ "--flow-space": "0.3em" } as React.CSSProperties}
          className="w-full text-xl"
          type="text"
          aria-label="Email Address"
          aria-required="true"
          placeholder="email@example.com"
          id="email"
          {...register("email")}
        />
        <label className="flex items-center gap-2" htmlFor="password">
          Password
          {errors.password && (
            <span className="text-red-500" role="alert">
              {errors.password.message}
            </span>
          )}
        </label>
        <input
          style={{ "--flow-space": "0.3em" } as React.CSSProperties}
          className="w-full text-xl"
          type="password"
          aria-required="true"
          placeholder="very safe password... 🤫"
          id="password"
          {...register("password")}
        />
        <label className="flex items-center gap-2" htmlFor="confirmPassword">
          Confirm Password
          {errors.confirmPassword && (
            <span className="text-red-500" role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>
        <input
          style={{ "--flow-space": "0.3em" } as React.CSSProperties}
          className="w-full text-xl"
          type="password"
          aria-required="true"
          placeholder="do it again..."
          id="confirmPassword"
          {...register("confirmPassword")}
        />
        {signupUserIsError && (
          <span className="text-red-500" role="alert">
            {signupUserError?.message}
          </span>
        )}
        <button disabled={signupUserIsPending} className="w-fit" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  // if valid email param has been provided we can seed the form
  const parsedEmailParam = emailVerificationOTPFormSchema
    .pick({ email: true })
    .safeParse({ email: ctx.query.email });

  const email = parsedEmailParam.success ? parsedEmailParam.data.email : null;

  return {
    props: { email },
  };
}
