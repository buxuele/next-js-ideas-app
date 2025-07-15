"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/db";
import PostCard from "@/components/posts/PostCard";

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      const newPosts = data.posts || [];

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, isLoading]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">探索发现</h1>
        <p className="text-gray-600">发现其他用户分享的精彩内容</p>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 && !isLoading ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                暂无内容
              </h3>
              <p className="mt-2 text-gray-500">
                还没有其他用户发布内容，成为第一个分享者吧！
              </p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} showDeleteButton={false} />
          ))
        )}
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

      {/* No More Posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">没有更多内容了</p>
        </div>
      )}
    </div>
  );
}
