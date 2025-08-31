"use client";

import { useState, forwardRef } from "react";
import Image from "next/image";
import { ImageInfo } from "@/lib/image-manager";

interface ThreeColumnGalleryProps {
  images: ImageInfo[];
}

const ThreeColumnGallery = forwardRef<HTMLDivElement, ThreeColumnGalleryProps>(
  ({ images }, ref) => {
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

    // 将图片分配到三列
    const distributeImages = (images: ImageInfo[]) => {
      const columns: ImageInfo[][] = [[], [], []];
      images.forEach((image, index) => {
        columns[index % 3].push(image);
      });
      return columns;
    };

    const columns = distributeImages(validImages);

    if (validImages.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            paddingTop: "48px",
            paddingBottom: "48px",
          }}
        >
          <p style={{ color: "#4b5563", margin: 0 }}>暂无图片</p>
        </div>
      );
    }

    return (
      <>
        {/* 三列瀑布流布局 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "12px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {column.map((image, imageIndex) => {
                const isLastImage =
                  validImages.length > 0 &&
                  image.filename === validImages[validImages.length - 1].filename;

                return (
                  <div
                    key={image.filename}
                    ref={isLastImage ? ref : null}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(image)}
                  >
                    <div
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={image.filename}
                        width={400}
                        height={300}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                        onError={() => handleImageError(image.filename)}
                        priority={imageIndex < 3} // 优先加载前几张图片
                      />
                    </div>
                    <div style={{ marginTop: "8px", padding: "0 4px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#4b5563",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          margin: 0,
                        }}
                        title={image.filename}
                      >
                        {image.filename}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 图片预览模态框 */}
        {selectedImage && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={closeModal}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  zIndex: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  padding: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  style={{ width: "24px", height: "24px", color: "white" }}
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
              <div style={{ position: "relative" }}>
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  width={800}
                  height={600}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "90vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                    width: "auto",
                    height: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: "16px",
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                <p style={{ fontSize: "18px", fontWeight: "500", margin: 0 }}>
                  {selectedImage.filename}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

ThreeColumnGallery.displayName = "ThreeColumnGallery";

export default ThreeColumnGallery;

