import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormSchema, loginFormSchema } from "@/server/routers/user-schema";
import { trpc } from "@/utils/trpc";

export default function LoginForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
  });

  const {
    mutate: login,
    isPending: loginIsPending,
    isError: loginIsError,
    error: loginError,
    reset: resetForm,
  } = trpc.login.useMutation();

  function loginNewUser(data: LoginFormSchema) {
    login(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          onSubmitted();
          utils.invalidate();
          resetForm();
        },
      },
    );
  }

  return (
    <form className="flow flex flex-col" onSubmit={handleSubmit(loginNewUser)}>
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
      {loginIsError && (
        <span className="text-red-500" role="alert">
          {loginError?.message}
        </span>
      )}
      <button disabled={loginIsPending} className="w-fit" type="submit">
        Submit
      </button>
    </form>
  );
}
