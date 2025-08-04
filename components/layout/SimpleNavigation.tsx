"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SimpleNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "画廊",
      href: "/",
      icon: "🖼️",
    },
    {
      name: "探索",
      href: "/explore",
      icon: "🔍",
    },
  ];

  return (
    <nav className="flex space-x-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                isActive
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
