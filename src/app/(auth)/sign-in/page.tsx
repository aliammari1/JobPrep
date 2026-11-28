"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AuthDivider,
  AuthShell,
  isGoogleAuthEnabled,
  safeCallbackUrl,
} from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  emailOrUsername: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
});

type SignInValues = z.infer<typeof signInSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<string | null>(
    null,
  );
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { emailOrUsername: "", password: "", rememberMe: true },
  });
  const { isSubmitting } = form.formState;

  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const onSubmit = async (values: SignInValues) => {
    setSubmitError(null);
    setNeedsVerification(null);
    setResent(false);

    const callbacks = {
      onSuccess: () => {
        router.push(callbackUrl);
        router.refresh();
      },
      onError: (ctx: { error: { message?: string } }) => {
        const message = ctx.error.message || "Couldn't sign you in.";
        if (message.toLowerCase().includes("verif")) {
          // Account exists but the email isn't verified yet — offer the
          // recovery path inline instead of a dead-end error.
          setNeedsVerification(
            values.emailOrUsername.includes("@") ? values.emailOrUsername : "",
          );
          setSubmitError(
            "Your email isn't verified yet. Resend the link below, then try again.",
          );
        } else {
          setSubmitError(message);
        }
      },
    };

    if (values.emailOrUsername.includes("@")) {
      await authClient.signIn.email(
        {
          email: values.emailOrUsername,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        callbacks,
      );
    } else {
      await authClient.signIn.username(
        {
          username: values.emailOrUsername,
          password: values.password,
        },
        callbacks,
      );
    }
  };

  const handleResend = async () => {
    const email = needsVerification || "";
    if (!email) return;
    setResending(true);
    setSubmitError(null);
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: callbackUrl,
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
      callbackURL: callbackUrl,
    });
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your job search."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {needsVerification !== null && (
        <Alert>
          <Icons.mail className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <span className="block">
              {resent
                ? `Verification link sent${needsVerification ? ` to ${needsVerification}` : ""}. Check your inbox (and spam folder).`
                : "No link in your inbox?"}
            </span>
            {!resent &&
              (needsVerification ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resending}
                  onClick={handleResend}
                >
                  {resending && (
                    <Icons.spinner className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Resend verification email
                </Button>
              ) : (
                <Link
                  href="/verify-email"
                  className="font-medium text-primary hover:underline"
                >
                  Go to the verification page
                </Link>
              ))}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="emailOrUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-11 pr-12"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  Remember me for 7 days
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-11 w-full text-base font-semibold"
            disabled={!ready || isSubmitting}
          >
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in
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

      <div className="flex items-center justify-center gap-3 text-sm">
        <Link href="/magic-link" className="text-primary hover:underline">
          Magic link
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/email-otp" className="text-primary hover:underline">
          Email code
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/phone-signin" className="text-primary hover:underline">
          Phone
        </Link>
      </div>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
