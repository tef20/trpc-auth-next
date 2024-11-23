import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type EmailVerificationRequestFormSchema,
  type EmailVerificationRequestFormSchemaWithConfirmation,
  emailVerificationRequestFormSchemaWithConfirmation,
} from "@/server/routers/user-schema";
import { trpc } from "@/utils/trpc";

export default function BeginSignUp() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailVerificationRequestFormSchemaWithConfirmation>({
    resolver: zodResolver(emailVerificationRequestFormSchemaWithConfirmation),
    mode: "onTouched",
  });

  const {
    mutate: triggerEmailVerification,
    isPending: triggerEmailVerificationIsPending,
    isError: triggerEmailVerificationIsError,
    error: triggerEmailVerificationError,
  } = trpc.requestEmailVerification.useMutation();

  function beginVerifyEmail(data: EmailVerificationRequestFormSchema) {
    triggerEmailVerification(data, {
      onSuccess: () => router.push(`/sign-up/verify?email=${data.email}`),
    });
  }

  return (
    <form
      className="flow flex flex-col"
      onSubmit={handleSubmit(beginVerifyEmail)}
    >
      <label className="flex items-center gap-2" htmlFor="username">
        username
        {errors.username && (
          <span className="text-red-500" role="alert">
            {errors.username.message}
          </span>
        )}
      </label>
      <input
        style={{ "--flow-space": "0.3em" } as React.CSSProperties}
        className="w-full text-xl"
        type="username"
        aria-required="true"
        placeholder="username"
        id="username"
        {...register("username")}
      />

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
      <label className="flex items-center gap-2" htmlFor="confirmEmail">
        Confirm Email
        {errors.confirmEmail && (
          <span className="text-red-500" role="alert">
            {errors.confirmEmail.message}
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
        {...register("confirmEmail")}
      />
      {triggerEmailVerificationIsError && (
        <span className="text-red-500" role="alert">
          {triggerEmailVerificationError?.message}
        </span>
      )}
      <button
        disabled={triggerEmailVerificationIsPending}
        className="w-fit"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
