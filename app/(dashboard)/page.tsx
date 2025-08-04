"use client";

import { useState, useEffect } from "react";
import { ImageInfo } from "@/lib/image-manager";
import ImageGallery from "@/components/gallery/ImageGallery";

export default function HomePage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/gallery");

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError(error instanceof Error ? error.message : "获取图片失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载图片中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchImages}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <p className="text-gray-600">共 {images.length} 张精选艺术作品</p>
        </div>

        <ImageGallery images={images} />
      </div>
    </div>
  );
}
