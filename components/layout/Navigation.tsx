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
    <nav className="bg-white shadow-lg border-b-2 border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              社交平台
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === "/"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                我的主页
              </Link>
              <Link
                href="/explore"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === "/explore"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-blue-200 hover:border-blue-400 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-blue-200">
                  <span className="text-white text-sm font-bold">
                    {(user?.displayName || user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName || user?.name || "用户"}
                </p>
                <p className="text-xs text-gray-500">
                  @{user?.username || "unknown"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-all duration-200 font-medium"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pathname === "/"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              我的主页
            </Link>
            <Link
              href="/explore"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pathname === "/explore"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
