import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// todo: move this to router file
const signupFormSchema = z.object({
  email: z.string().email({ message: "must be valid" }),
  password: z.string().min(8, { message: "min. 8 characters long" }),
});

export type SignupFormSchema = z.infer<typeof signupFormSchema>;

type SignupFormProps = {
  onSubmitted?: () => void;
};

export default function SignUpForm({ onSubmitted }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormSchema>({
    resolver: zodResolver(signupFormSchema),
    mode: "onTouched",
  });

  function signupNewUser() {
    console.log("submit");

    onSubmitted?.();
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

      <button className="w-fit" type="submit">
        Submit
      </button>
    </form>
  );
}
