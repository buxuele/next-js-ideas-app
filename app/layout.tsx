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
  title: "艺术画廊",
  description: "精选艺术作品展示平台",
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
