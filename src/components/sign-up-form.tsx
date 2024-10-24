import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupFormSchema,
  SignupFormSchema,
} from "@/server/routers/user-schema";
import { trpc } from "@/utils/trpc";

export default function SignUpForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormSchema>({
    resolver: zodResolver(signupFormSchema),
    mode: "onTouched",
  });

  const {
    mutate: signup,
    isPending: signupIsPending,
    isError: signupIsError,
    error: signupError,
    reset: resetForm,
  } = trpc.signup.useMutation();

  function signupNewUser(data: SignupFormSchema) {
    signup(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          onSubmitted();
          resetForm();
          utils.me.invalidate();
        },
      },
    );
  }

  return (
    <form className="flow flex flex-col" onSubmit={handleSubmit(signupNewUser)}>
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
      {signupIsError && (
        <span className="text-red-500" role="alert">
          {signupError?.message}
        </span>
      )}
      <button disabled={signupIsPending} className="w-fit" type="submit">
        Submit
      </button>
    </form>
  );
}
