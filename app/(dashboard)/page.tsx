"use client";

import { useState, useEffect } from "react";
import { ImageInfo } from "@/lib/image-manager";
import ThreeColumnGallery from "@/components/gallery/ThreeColumnGallery";

export default function HomePage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 先获取文件夹列表
      const foldersResponse = await fetch("/api/folders");
      if (!foldersResponse.ok) {
        throw new Error("Failed to fetch folders");
      }

      const foldersData = await foldersResponse.json();
      const firstFolder = foldersData.folders?.[0];

      if (!firstFolder) {
        setImages([]);
        return;
      }

      // 获取第一个文件夹的图片
      const response = await fetch(
        `/api/images?folder=${encodeURIComponent(firstFolder)}`
      );

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "2px solid #d97706",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              margin: "0 auto 16px auto",
            }}
          ></div>
          <p style={{ color: "#4b5563", margin: 0 }}>加载图片中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={fetchImages}
            style={{
              padding: "8px 16px",
              backgroundColor: "#d97706",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return <ThreeColumnGallery images={images} />;
}
