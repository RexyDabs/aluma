import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RoleBasedNavigation from "../components/RoleBasedNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aluma - Trade Business Management",
  description: "Complete SaaS solution for tradies and sole traders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50`}>
        <RoleBasedNavigation />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
