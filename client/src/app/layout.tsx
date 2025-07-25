import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import StoreProvider from "@/redux/store";

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Sistema de gestão de inventário",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
