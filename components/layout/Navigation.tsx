"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavigationProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
    displayName?: string;
  } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="bg-amber-50 shadow-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              社交平台
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                我的主页
              </Link>
              <Link
                href="/explore"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/explore"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                探索发现
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.displayName || user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {(user?.displayName || user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || user?.name || "用户"}
                </p>
                <p className="text-xs text-gray-500">
                  @{user?.username || "unknown"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              我的主页
            </Link>
            <Link
              href="/explore"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/explore"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              探索发现
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
