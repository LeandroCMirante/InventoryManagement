// src/components/auth/AuthLayout.tsx
import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="relative flex w-full max-w-md flex-col rounded-xl bg-white shadow-lg">
        <div className="relative mx-4 -mt-6 mb-4 grid h-28 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/40">
          <h3 className="text-3xl font-semibold">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
