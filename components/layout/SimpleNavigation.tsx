"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function SimpleNavigation() {
  const pathname = usePathname();
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    // 获取图片文件夹列表
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (response.ok) {
          const data = await response.json();
          setFolders(data.folders || []);
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        // 如果API失败，使用默认的文件夹名称
        setFolders(["art", "good_art", "t-恤--收集", "top10"]);
      }
    };

    fetchFolders();
  }, []);

  const navItems = folders.map((folder, index) => ({
    name: folder,
    href: index === 0 ? "/" : `/${encodeURIComponent(folder)}`,
  }));

  return (
    <nav className="flex items-center space-x-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${
                isActive
                  ? "bg-gray-600 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
