"use client";

import { useState, FormEvent, ComponentProps, ChangeEvent } from "react";
import { useLoginMutation } from "@/services/api"; // Make sure this path is correct
import { setCredentials } from "@/redux/slices/authSlice"; // Make sure this path is correct
import { useAppDispatch } from "@/redux/hooks"; // Make sure this path is correct
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/ui/AuthLayout"; // Make sure this path is correct

// --- Reusable UI Components with Correct Types ---
// These should be in their own files, e.g., `src/components/ui/Input.tsx`

type InputProps = ComponentProps<"input">;

const Input = (props: InputProps) => (
  <input className="w-full rounded-md border p-3 text-sm" {...props} />
);

type ButtonProps = ComponentProps<"button">;

const Button = (props: ButtonProps) => (
  <button
    className="w-full rounded-lg bg-blue-600 p-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    {...props}
  />
);

// --- Login Page Component ---

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const authData = await login({ email, password }).unwrap();
      // Dispatch the action to save user credentials in the Redux store
      dispatch(setCredentials(authData));
      // On success, redirect to the main dashboard page
      router.push("/");
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  // Helper function to handle input changes with correct types
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };

  return (
    <AuthLayout title="Log In">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleInputChange(e, setEmail)}
          disabled={isLoading}
          required
        />
        <Input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => handleInputChange(e, setPassword)}
          disabled={isLoading}
          required
        />

        {error && "data" in error && (
          <div className="text-red-600 text-sm">
            {/* Safer way to display potential error messages */}
            Error:{" "}
            {typeof (error.data as any)?.error === "string"
              ? (error.data as any).error
              : "Invalid credentials."}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account?
          <Link
            href="/register"
            className="ml-1 font-bold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
