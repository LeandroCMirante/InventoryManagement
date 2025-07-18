"use client";

import { useState, FormEvent, ComponentProps, ChangeEvent } from "react";
import { useRegisterMutation } from "@/services/api"; // Make sure this path is correct
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/ui/AuthLayout"; // Make sure this path is correct

type InputProps = ComponentProps<"input">;

const Input = (props: InputProps) => (
  <input className="w-full rounded-md border p-3 text-sm" {...props} />
);

// We do the same for the button component.
type ButtonProps = ComponentProps<"button">;

const Button = (props: ButtonProps) => (
  <button
    className="w-full rounded-lg bg-blue-600 p-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    {...props}
  />
);

// --- Register Page Component ---

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [register, { isLoading, error }] = useRegisterMutation();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      console.log({ name, email, password });
      await register({ name, email, password }).unwrap();
      // On success, redirect to the login page
      router.push("/login");
    } catch (err) {
      // The error is already handled by the `error` object from the hook
      console.error("Failed to register:", err);
    }
  };

  // Here, we tell TypeScript that 'e' is a ChangeEvent on an HTMLInputElement
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => handleInputChange(e, setName)}
          disabled={isLoading}
          required
        />
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
            {/* We need to be careful here, as error.data might not have an 'error' property */}
            Error:{" "}
            {typeof (error.data as any)?.error === "string"
              ? (error.data as any).error
              : "An unknown error occurred."}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 font-bold text-blue-600 hover:underline"
          >
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
