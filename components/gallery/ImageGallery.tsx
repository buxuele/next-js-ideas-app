"use client";

import { useState } from "react";
import { ImageInfo } from "@/lib/image-manager";
import Image from "next/image";

interface ImageGalleryProps {
  images: ImageInfo[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );

  const handleImageError = (filename: string) => {
    setImageLoadErrors((prev) => new Set(prev).add(filename));
  };

  const handleImageClick = (image: ImageInfo) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // 过滤掉加载失败的图片
  const validImages = images.filter(
    (image) => !imageLoadErrors.has(image.filename)
  );

  if (validImages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🖼️</div>
        <p className="text-gray-600">暂无图片</p>
      </div>
    );
  }

  return (
    <>
      {/* 瀑布流布局 */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {validImages.map((image, index) => (
          <div
            key={image.filename}
            className="break-inside-avoid mb-4 cursor-pointer group"
            onClick={() => handleImageClick(image)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              <Image
                src={image.url}
                alt={image.filename}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
                onError={() => handleImageError(image.filename)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />

              {/* 悬停遮罩 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <svg
                      className="w-6 h-6 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 图片信息 */}
            <div className="mt-2 px-1">
              <p
                className="text-sm text-gray-600 truncate"
                title={image.filename}
              >
                {image.filename}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* 关闭按钮 */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 text-white"
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

            {/* 图片 */}
            <div className="relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.filename}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* 图片信息 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-lg font-medium">{selectedImage.filename}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
