// Ficheiro: src/app/(main)/layout.tsx
"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar"; // Ajuste o caminho se necessário
import Sidebar from "@/app/(components)/Sidebar"; // Ajuste o caminho se necessário
import { useAppSelector } from "@/redux/hooks";
import AuthGuard from "@/components/auth/AuthGuard"; // O nosso guarda de autenticação

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    // Lógica para alternar o tema dark/light
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    // O AuthGuard protege tudo dentro deste layout
    <AuthGuard>
      <div className={`flex min-h-screen w-full`}>
        <Sidebar />
        <main
          className={`flex h-full w-full flex-col bg-gray-50 p-4 transition-all duration-300 dark:bg-gray-900 ${
            isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
          }`}
        >
          <Navbar />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
