"use client";

import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/redux/slices";
import { logOut, selectCurrentUser } from "@/redux/slices/authSlice";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

// --- Componente do Dropdown do Perfil ---
// É uma boa prática separar esta lógica complexa num componente próprio.
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logOut());
    dispatch(api.util.resetApiState());
    router.push("/login");
  };

  // Fecha o dropdown se o utilizador clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Perfil que abre o dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {/* Mostra as iniciais do nome do utilizador */}
          {user?.name.charAt(0).toUpperCase() || <UserIcon size={20} />}
        </div>
        <span className="font-semibold hidden md:block dark:text-gray-200">
          {user?.name || "Usuário"}
        </span>
      </button>

      {/* O menu dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} />
            Configurações
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal da Navbar ---
const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () =>
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkmode = () => dispatch(setIsDarkMode(!isDarkMode));

  return (
    <nav className="flex w-full items-center justify-between">
      {/* Lado Esquerdo: Menu e Pesquisa */}
      <div className="flex items-center gap-4">
        <button
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="search"
            placeholder="Pesquisar por produtos..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Lado Direito: Ações e Perfil */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkmode}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-gray-600" />
          )}
        </button>

        <div className="relative">
          <button
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              3
            </span>
          </button>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-600 hidden md:block" />

        <ProfileDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
