"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage(
        "Account created! If email confirmation is turned on, check your inbox, then sign in."
      );
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      {/* eslint-disable-next-line */}
      <div className="card bg-base-100 shadow-xl w-full transition-shadow duration-300 hover:shadow-2xl rounded-2xl">
        <div className="card-body">
          <h2 className="card-title justify-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-center text-sm opacity-70">
            {mode === "signin"
              ? "Sign in to track your concert spending and fun."
              : "Sign up to start logging concerts and costs."}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[6.5rem_1fr] items-center gap-x-3 gap-y-1">
              <label className="text-sm font-medium text-right" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />

              <label
                className="text-sm font-medium text-right"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="alert alert-error text-sm animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="alert alert-success text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full transition-transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {loading
                ? "Please wait..."
                : mode === "signin"
                  ? "Log in"
                  : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm mt-2">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="link link-primary"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="link link-primary"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

