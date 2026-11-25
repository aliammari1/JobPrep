"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AuthDivider,
  AuthShell,
  isGoogleAuthEnabled,
} from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    username: z
      .string()
      .regex(
        /^[a-zA-Z0-9_]{3,20}$/,
        "3–20 characters: letters, numbers, underscores",
      )
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, "Please accept the terms"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

function passwordScore(password: string): { value: number; label: string } {
  if (!password) return { value: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score += 1;
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Very strong"];
  return { value: (score / 4) * 100, label: labels[score] };
}

export default function SignUpPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });
  const { isSubmitting } = form.formState;
  const password = form.watch("password");
  const strength = passwordScore(password);

  const onSubmit = async (values: SignUpValues) => {
    setSubmitError(null);
    const result = await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        ...(values.username ? { username: values.username } : {}),
        callbackURL: "/dashboard",
      },
      {
        onError: (ctx: { error: { message?: string } }) => {
          setSubmitError(ctx.error.message || "Couldn't create your account.");
        },
      },
    );
    if (result.error) {
      setSubmitError(result.error.message || "Couldn't create your account.");
    } else {
      setCreatedEmail(values.email);
    }
  };

  const handleResend = async () => {
    if (!createdEmail) return;
    setResending(true);
    setSubmitError(null);
    const result = await authClient.sendVerificationEmail({
      email: createdEmail,
      callbackURL: "/dashboard",
    });
    setResending(false);
    if (result.error) {
      setSubmitError(
        result.error.message || "Couldn't resend the verification email.",
      );
    } else {
      setResent(true);
    }
  };

  const handleGoogle = async () => {
    setSubmitError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  if (createdEmail) {
    return (
      <AuthShell
        title="Check your inbox"
        description={`We sent a verification link to ${createdEmail}.`}
      >
        <div className="flex justify-center">
          <span className="grid size-16 place-items-center rounded-full bg-green-500/15">
            <Icons.check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </span>
        </div>
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {resent
            ? "Link re-sent — check your inbox and spam folder."
            : "Open the link in the email to activate your account, then sign in."}
        </p>
        {!resent && (
          <Button
            variant="outline"
            className="h-11 w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Resend verification email
          </Button>
        )}
        {process.env.NODE_ENV === "development" && (
          <Alert>
            <Icons.info className="h-4 w-4" />
            <AlertDescription>
              Local dev has no mailbox — the link is printed in the dev
              server&apos;s console output.
            </AlertDescription>
          </Alert>
        )}
        <Button asChild className="h-11 w-full">
          <Link href="/sign-in">Continue to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start turning applications into offers."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="ada_lovelace"
                    autoComplete="username"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="h-11 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <Icons.eyeOff className="h-4 w-4" />
                      ) : (
                        <Icons.eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                {password && (
                  <div className="space-y-1 pt-1">
                    <Progress value={strength.value} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Password strength: {strength.label}
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </div>
                <FormDescription className="sr-only">
                  Required to create an account
                </FormDescription>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-11 w-full text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create account
          </Button>
        </form>
      </Form>

      {isGoogleAuthEnabled() && (
        <>
          <AuthDivider label="Or continue with" />
          <Button
            variant="outline"
            type="button"
            className="h-11 w-full"
            onClick={handleGoogle}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </>
      )}
    </AuthShell>
  );
}
