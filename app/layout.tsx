import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/ToastContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "社交平台",
  description: "基于 GitHub 认证的社交分享平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 移除 SessionProvider */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
