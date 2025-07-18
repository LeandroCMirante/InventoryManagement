// Ficheiro: src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Suas fontes
import "./globals.css";
import StoreProvider from "@/redux/store"; // Importe o seu provider

const geistSans = Geist({
  /* ... */
});
const geistMono = Geist_Mono({
  /* ... */
});

export const metadata: Metadata = {
  /* ... */
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        {/* O StoreProvider envolve toda a aplicação */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
