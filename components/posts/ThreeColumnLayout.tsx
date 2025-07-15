"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Post } from "@/lib/db";
import PostCard from "./PostCard";

interface ThreeColumnLayoutProps {
  posts: Post[];
  onLoadMore?: () => void;
  onPostDeleted?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export default function ThreeColumnLayout({
  posts,
  onLoadMore,
  onPostDeleted,
  hasMore = false,
  isLoading = false,
}: ThreeColumnLayoutProps) {
  const [columns, setColumns] = useState<Post[][]>([[], [], []]);
  const observerRef = useRef<HTMLDivElement>(null);

  // Distribute posts into columns using masonry layout
  const distributePosts = useCallback((postsToDistribute: Post[]) => {
    const newColumns: Post[][] = [[], [], []];

    postsToDistribute.forEach((post, index) => {
      // Simple distribution: round-robin
      const columnIndex = index % 3;
      newColumns[columnIndex].push(post);
    });

    return newColumns;
  }, []);

  // Update columns when posts change
  useEffect(() => {
    if (posts.length > 0) {
      const newColumns = distributePosts(posts);
      setColumns(newColumns);
    } else {
      setColumns([[], [], []]);
    }
  }, [posts, distributePosts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            还没有任何帖子
          </h3>
          <p className="mt-2 text-gray-500">开始分享你的第一个想法吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Three Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((columnPosts, columnIndex) => (
          <div key={columnIndex} className="space-y-6">
            {columnPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showDeleteButton={true}
                onDelete={onPostDeleted}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">加载中...</span>
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !isLoading && <div ref={observerRef} className="h-10" />}

      {/* No More Posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">没有更多帖子了</p>
        </div>
      )}
    </div>
  );
}
