"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Post } from "@/lib/db";
import PostCreationForm from "@/components/posts/PostCreationForm";
import ThreeColumnLayout from "@/components/posts/ThreeColumnLayout";

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/me?page=${pageNum}&limit=20`);

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

      setHasMore(newPosts.length === 20);
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

  const handlePostCreated = () => {
    // Refresh posts from the beginning
    fetchPosts(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handlePostDeleted = () => {
    // Refresh posts from the beginning
    fetchPosts(1, false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          欢迎回来，{session?.user?.displayName || session?.user?.name}！
        </h1>
        <p className="text-gray-600">分享你的想法，记录生活的美好瞬间</p>
      </div>

      {/* Post Creation Form */}
      <div className="mb-8">
        <PostCreationForm onPostCreated={handlePostCreated} />
      </div>

      {/* 3-Column Layout */}
      <ThreeColumnLayout
        posts={posts}
        onLoadMore={handleLoadMore}
        onPostDeleted={handlePostDeleted}
        hasMore={hasMore}
        isLoading={isLoading}
      />
    </div>
  );
}
