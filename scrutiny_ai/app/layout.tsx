import type { Metadata } from "next";
// import localFont from "next/font/local";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";
import AppProvider from "@/contexts/AppProvider";
import { Inter } from "next/font/google";
import {NextUIProvider} from "@nextui-org/system";
import React from "react";

// const geistSans = localFont({
//   src: "fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scrutiny AI",
  description: "Scrutiny AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <UserProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </UserProvider>
    </AppProvider>
  );
}
