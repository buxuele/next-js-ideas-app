"use client";

import { useState } from "react";
import { Post } from "@/lib/db";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface PostCardProps {
  post: Post;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export default function PostCard({
  post,
  showDeleteButton = false,
  onDelete,
}: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleDelete = async () => {
    if (!window.confirm("确定要删除这个帖子吗？删除后无法恢复。")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === (post.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? (post.images?.length || 1) - 1 : prev - 1
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        {/* Post Content */}
        <div className="p-5">
          <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="px-5 pb-4">
            {post.images.length === 1 ? (
              // Single image
              <div
                className="relative cursor-pointer rounded-xl overflow-hidden group"
                onClick={() => openImageModal(0)}
              >
                <OptimizedImage
                  src={post.images[0].image_data}
                  alt="Post image"
                  width={post.images[0].width || 400}
                  height={post.images[0].height || 300}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            ) : (
              // Multiple images grid - improved layout
              <div
                className={`grid gap-3 ${
                  post.images.length === 2
                    ? "grid-cols-2"
                    : post.images.length === 3
                    ? "grid-cols-3"
                    : post.images.length === 4
                    ? "grid-cols-2 grid-rows-2"
                    : "grid-cols-3"
                }`}
              >
                {post.images.slice(0, 5).map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden group ${
                      post.images!.length === 3 && index === 0
                        ? "row-span-2"
                        : post.images!.length === 5 && index === 0
                        ? "col-span-2 row-span-2"
                        : ""
                    }`}
                    onClick={() => openImageModal(index)}
                  >
                    <div
                      className={`relative ${
                        post.images!.length === 3 && index === 0
                          ? "aspect-[4/5]"
                          : post.images!.length === 5 && index === 0
                          ? "aspect-[4/3]"
                          : "aspect-square"
                      }`}
                    >
                      <OptimizedImage
                        src={image.image_data}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>

                      {/* Show count for more than 5 images */}
                      {index === 4 && post.images!.length > 5 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            +{post.images!.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Author Info (for explore page) */}
            {post.user && (
              <div className="flex items-center space-x-2">
                {post.user.avatar_url ? (
                  <Image
                    src={post.user.avatar_url}
                    alt={post.user.display_name || post.user.username}
                    width={28}
                    height={28}
                    className="rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {(post.user.display_name || post.user.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {post.user.display_name || post.user.username}
                </span>
              </div>
            )}

            {/* Timestamp */}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>

          {/* Delete Button */}
          {showDeleteButton && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {isDeleting ? "删除中..." : "删除"}
            </button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && post.images && post.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <OptimizedImage
                src={post.images[selectedImageIndex].image_data}
                alt={`Post image ${selectedImageIndex + 1}`}
                width={post.images[selectedImageIndex].width || 800}
                height={post.images[selectedImageIndex].height || 600}
                className="max-w-full max-h-[80vh] object-contain"
                priority={true}
              />
            </div>

            {/* Image Counter */}
            {post.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {post.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
