import {
  emailVerificationOTPFormSchema,
  type EmailVerificationOTPFormSchema,
} from "@/server/routers/user-schema";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { type GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function VerifyEmailForSignup({
  email,
}: {
  email: string | null;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailVerificationOTPFormSchema>({
    defaultValues: { email: email || "", code: "" },
    resolver: zodResolver(emailVerificationOTPFormSchema),
    mode: "onTouched",
  });

  const {
    mutate: verifyOTP,
    isPending: verifyOTPIsPending,
    isError: verifyOTPIsError,
    error: verifyOTPError,
  } = trpc.checkEmailVerificationOTP.useMutation();

  function verifyEmail(data: EmailVerificationOTPFormSchema) {
    verifyOTP(data, {
      onSuccess: () => {
        router.push("/sign-up/user-info");
      },
    });
  }

  return (
    <div className="pancake-stack content-wrapper">
      <form className="flow flex flex-col" onSubmit={handleSubmit(verifyEmail)}>
        {!email && (
          <>
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
          </>
        )}
        <label className="flex items-center gap-2" htmlFor="code">
          Verification Code
          {errors.code && (
            <span className="text-red-500" role="alert">
              {errors.code.message}
            </span>
          )}
        </label>
        <input
          style={{ "--flow-space": "0.3em" } as React.CSSProperties}
          className="w-full text-xl"
          type="text"
          aria-label="Verification Code"
          aria-required="true"
          id="code"
          {...register("code")}
        />
        {verifyOTPIsError && (
          <span className="text-red-500" role="alert">
            {verifyOTPError?.message}
          </span>
        )}
        <button disabled={verifyOTPIsPending} className="w-fit" type="submit">
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
